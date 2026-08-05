/**
 * Import WooCommerce product CSV into Supabase catalog.
 *
 * Usage (from repo root):
 *   corepack pnpm --filter @workspace/scripts run import:wc-products
 *
 * Requires in root `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

config({ path: path.join(repoRoot, ".env.local") });
config({ path: path.join(repoRoot, "artifacts/moonsteel/.env.local"), override: false });

const BUCKET = "catalog-product-images";
const CSV_PATH =
  process.env.WC_PRODUCTS_CSV ||
  path.join(__dirname, "../data/wc-products.csv");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type WcRow = Record<string, string>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeEntities(html: string): string {
  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&#\d+;/g, (m) => {
      const n = Number(m.slice(2, -1));
      return Number.isFinite(n) ? String.fromCharCode(n) : m;
    });
}

function stripHtml(html: string): string {
  return decodeEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildDetails(shortDesc: string, description: string): string {
  const short = stripHtml(shortDesc || "");
  const long = stripHtml(description || "");
  if (short && long && short !== long) return `${short}\n\n${long}`;
  return short || long;
}

function parseImageUrls(raw: string): string[] {
  return (raw || "")
    .split(",")
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));
}

function parseCategories(raw: string): string[] {
  return (raw || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function contentTypeFromUrl(url: string): string {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

function fileNameFromUrl(url: string): string {
  try {
    const base = path.basename(new URL(url).pathname);
    return base.replace(/[^a-zA-Z0-9._-]/g, "-") || "image.jpg";
  } catch {
    return "image.jpg";
  }
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string; fileName: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MoonSteelImporter/1.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  ! image ${res.status}: ${url}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: res.headers.get("content-type") || contentTypeFromUrl(url),
      fileName: fileNameFromUrl(url),
    };
  } catch (err) {
    console.warn(`  ! image fetch failed: ${url}`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function uploadImages(slug: string, urls: string[]): Promise<string[]> {
  const uploaded: string[] = [];

  for (let i = 0; i < urls.length; i++) {
    const downloaded = await downloadImage(urls[i]);
    if (!downloaded) continue;

    const filePath = `${slug}/${randomUUID()}-${i + 1}-${downloaded.fileName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, downloaded.buffer, {
      contentType: downloaded.contentType,
      upsert: false,
    });

    if (error) {
      console.warn(`  ! upload failed (${filePath}): ${error.message}`);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}

async function ensureCategory(name: string, sortOrder: number): Promise<string> {
  const slug = slugify(name);
  const { data: existing, error: findError } = await supabase
    .from("catalog_categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (findError) throw findError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("catalog_categories")
    .insert({
      name,
      slug,
      description: null,
      sort_order: sortOrder,
      published: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function upsertProduct(input: {
  name: string;
  slug: string;
  details: string;
  sortOrder: number;
  published: boolean;
  imageUrls: string[];
  categoryIds: string[];
}) {
  const payload = {
    name: input.name,
    slug: input.slug,
    details: input.details,
    sort_order: input.sortOrder,
    published: input.published,
    image_url: input.imageUrls[0] ?? "",
    image_urls: input.imageUrls,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: findError } = await supabase
    .from("catalog_products")
    .select("id")
    .eq("slug", input.slug)
    .maybeSingle();
  if (findError) throw findError;

  let productId: string;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("catalog_products")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    productId = data.id as string;
  } else {
    const { data, error } = await supabase
      .from("catalog_products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    productId = data.id as string;
  }

  await supabase.from("catalog_product_categories").delete().eq("product_id", productId);

  if (input.categoryIds.length > 0) {
    const { error: linkError } = await supabase.from("catalog_product_categories").insert(
      input.categoryIds.map((category_id) => ({
        product_id: productId,
        category_id,
      })),
    );
    if (linkError) throw linkError;
  }

  return productId;
}

async function main() {
  console.log(`Reading ${CSV_PATH}`);
  const csvText = readFileSync(CSV_PATH, "utf8");
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  }) as WcRow[];

  console.log(`Found ${rows.length} WooCommerce rows`);

  const categoryNames = new Set<string>();
  for (const row of rows) {
    for (const cat of parseCategories(row.Categories || "")) {
      categoryNames.add(cat);
    }
  }

  const categoryIdByName = new Map<string, string>();
  let catSort = 10;
  for (const name of [...categoryNames].sort((a, b) => a.localeCompare(b))) {
    const id = await ensureCategory(name, catSort);
    categoryIdByName.set(name, id);
    catSort += 10;
    console.log(`Category OK: ${name}`);
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const name = decodeEntities((row.Name || "").trim());
    if (!name) {
      skipped += 1;
      continue;
    }

    const slug = slugify(name);
    const published = row.Published === "1";
    const details = buildDetails(row["Short description"] || "", row.Description || "");
    const sourceImages = parseImageUrls(row.Images || "");
    const categoryIds = parseCategories(row.Categories || "")
      .map((c) => categoryIdByName.get(c))
      .filter((id): id is string => Boolean(id));

    console.log(`\n[${index + 1}/${rows.length}] ${name}`);
    console.log(`  slug=${slug} images=${sourceImages.length} cats=${categoryIds.length}`);

    try {
      const uploaded = sourceImages.length > 0 ? await uploadImages(slug, sourceImages) : [];
      if (uploaded.length === 0 && sourceImages.length > 0) {
        console.warn("  ! no images uploaded — product will still be saved with empty image_url");
      }

      await upsertProduct({
        name,
        slug,
        details,
        sortOrder: (index + 1) * 10,
        published,
        imageUrls: uploaded,
        categoryIds,
      });

      imported += 1;
      console.log(`  ✓ imported (${uploaded.length} images)`);
    } catch (err) {
      failed += 1;
      console.error(`  ✗ failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. imported=${imported} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
