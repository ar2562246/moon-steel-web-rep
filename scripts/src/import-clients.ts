/**
 * Apply clients.sql, seed clients, and upload reference letter scans.
 *
 * Usage:
 *   corepack pnpm --filter @workspace/scripts run import:clients
 *
 * Requires in root `.env.local`:
 *   DATABASE_URL
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   CLIENT_CERTS_DIR — override path to Certificates folder
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

config({ path: path.join(repoRoot, ".env.local") });
config({ path: path.join(repoRoot, "artifacts/moonsteel/.env.local"), override: false });

const BUCKET = "client-references";
const DEFAULT_CERTS_DIR =
  "/Users/ar/Library/CloudStorage/GoogleDrive-moonsteelf@gmail.com/My Drive/OfficeData/INTRODUCTION/Certificates";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const certsDir = process.env.CLIENT_CERTS_DIR || DEFAULT_CERTS_DIR;
const skipSql = process.env.SKIP_SQL === "1";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type ClientSeed = {
  name: string;
  industry: string;
  locations?: string;
  notes?: string;
  sort_order?: number;
};

type ReferenceSeed = {
  slug: string;
  client_name: string;
  industry: string;
  client_match: string;
  issued_on: string | null;
  quote: string;
  source_file: string;
  /** Clockwise degrees needed to make the scan upright (several were scanned 180° flipped). */
  rotate?: 90 | 180 | 270;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".pdf") return "application/pdf";
  return "image/jpeg";
}

async function applySql() {
  if (skipSql) {
    console.log("Skipping SQL (SKIP_SQL=1).");
    return;
  }
  if (!databaseUrl || /localhost|127\.0\.0\.1/.test(databaseUrl)) {
    console.log(
      "Skipping local DATABASE_URL — apply artifacts/moonsteel/supabase/clients.sql remotely first (or set a remote DATABASE_URL).",
    );
    return;
  }
  const sqlPath = path.join(repoRoot, "artifacts/moonsteel/supabase/clients.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    console.log("Applying clients.sql…");
    await client.query(sql);
    console.log("Schema ready.");
  } finally {
    await client.end();
  }
}

async function seedClients(rows: ClientSeed[]) {
  let upserted = 0;
  for (const row of rows) {
    const slug = slugify(row.name);
    const { error } = await supabase.from("clients").upsert(
      {
        slug,
        name: row.name,
        industry: row.industry,
        locations: row.locations ?? null,
        notes: row.notes ?? null,
        sort_order: row.sort_order ?? 100,
        published: true,
      },
      { onConflict: "slug" },
    );
    if (error) {
      console.error(`client fail ${row.name}: ${error.message}`);
      continue;
    }
    upserted += 1;
  }
  console.log(`Clients upserted: ${upserted}`);
}

async function resolveClientId(name: string): Promise<string | null> {
  const { data } = await supabase.from("clients").select("id").eq("name", name).maybeSingle();
  return data?.id ?? null;
}

/**
 * Rotates a copy of the scan with `sips` (macOS) and returns the rotated bytes.
 * Originals in Drive are left untouched.
 */
function rotatedBytes(abs: string, degrees: number): Buffer {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "msf-refs-"));
  const out = path.join(tmpDir, path.basename(abs));
  try {
    execFileSync("sips", ["-r", String(degrees), abs, "--out", out], { stdio: "pipe" });
    return readFileSync(out);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function uploadReference(row: ReferenceSeed): Promise<string | null> {
  const abs = path.join(certsDir, row.source_file);
  if (!existsSync(abs)) {
    console.error(`Missing file: ${abs}`);
    return null;
  }
  const ext = path.extname(abs).toLowerCase() || ".jpg";
  const buf = row.rotate ? rotatedBytes(abs, row.rotate) : readFileSync(abs);
  // Rotated renditions get their own object name so the public CDN cannot serve
  // the previously uploaded flipped copy.
  const objectPath = row.rotate ? `${row.slug}-r${row.rotate}${ext}` : `${row.slug}${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
    contentType: contentType(abs),
    upsert: true,
  });
  if (error) {
    console.error(`upload fail ${row.slug}: ${error.message}`);
    return null;
  }
  if (row.rotate) {
    await supabase.storage.from(BUCKET).remove([`${row.slug}${ext}`]);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function seedReferences(rows: ReferenceSeed[]) {
  let upserted = 0;
  for (const row of rows) {
    const imageUrl = await uploadReference(row);
    if (!imageUrl) continue;

    const clientId = await resolveClientId(row.client_match);
    const { error } = await supabase.from("client_references").upsert(
      {
        slug: row.slug,
        client_name: row.client_name,
        industry: row.industry,
        issued_on: row.issued_on,
        quote: row.quote,
        image_url: imageUrl,
        client_id: clientId,
        sort_order: 100,
        published: true,
      },
      { onConflict: "slug" },
    );
    if (error) {
      console.error(`reference fail ${row.slug}: ${error.message}`);
      continue;
    }
    upserted += 1;
    console.log(`reference: ${row.client_name}`);
  }
  console.log(`References upserted: ${upserted}`);
}

async function main() {
  await applySql();

  const clients = JSON.parse(
    readFileSync(path.join(__dirname, "../data/clients-seed.json"), "utf8"),
  ) as ClientSeed[];
  const references = JSON.parse(
    readFileSync(path.join(__dirname, "../data/client-references-seed.json"), "utf8"),
  ) as ReferenceSeed[];

  await seedClients(clients);
  await seedReferences(references);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
