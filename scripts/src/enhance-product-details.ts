/**
 * Apply standardized product details from product-details-enhanced.json.
 *
 * Usage:
 *   corepack pnpm --filter @workspace/scripts run enhance:product-details
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

config({ path: path.join(repoRoot, ".env.local") });
config({ path: path.join(repoRoot, "artifacts/moonsteel/.env.local"), override: false });

const DATA_PATH = path.join(__dirname, "../data/product-details-enhanced.json");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type EnhancedRow = {
  slug: string;
  name: string;
  details: string;
};

async function main() {
  const rows = JSON.parse(readFileSync(DATA_PATH, "utf8")) as EnhancedRow[];

  const { data: existing, error: listError } = await supabase
    .from("catalog_products")
    .select("id, slug, name");

  if (listError) {
    console.error(listError.message);
    process.exit(1);
  }

  const bySlug = new Map((existing ?? []).map((p) => [p.slug, p]));
  const missing: string[] = [];
  const unused = new Set(bySlug.keys());

  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    const product = bySlug.get(row.slug);
    if (!product) {
      missing.push(row.slug);
      continue;
    }
    unused.delete(row.slug);

    const { error } = await supabase
      .from("catalog_products")
      .update({ details: row.details.trim() })
      .eq("id", product.id);

    if (error) {
      failed += 1;
      console.error(`FAIL ${row.slug}: ${error.message}`);
      continue;
    }

    updated += 1;
    console.log(`updated: ${row.name}`);
  }

  console.log(`\nDone. updated=${updated} failed=${failed}`);
  if (missing.length) console.log(`Missing slugs in DB (${missing.length}):`, missing.join(", "));
  if (unused.size) console.log(`DB products not in file (${unused.size}):`, [...unused].join(", "));
}

main();
