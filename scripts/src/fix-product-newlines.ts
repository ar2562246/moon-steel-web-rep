/**
 * One-off: convert literal "\n" / "\r\n" sequences in catalog_products.details
 * into real newlines (WooCommerce CSV export artifact).
 *
 * Usage:
 *   corepack pnpm --filter @workspace/scripts exec tsx ./src/fix-product-newlines.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

config({ path: path.join(repoRoot, ".env.local") });
config({ path: path.join(repoRoot, "artifacts/moonsteel/.env.local"), override: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeNewlines(text: string): string {
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const { data, error } = await supabase
    .from("catalog_products")
    .select("id, name, details");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let updated = 0;
  for (const row of data ?? []) {
    const next = normalizeNewlines(row.details ?? "");
    if (next === (row.details ?? "")) continue;

    const { error: updateError } = await supabase
      .from("catalog_products")
      .update({ details: next })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Failed ${row.name}: ${updateError.message}`);
      continue;
    }
    updated += 1;
    console.log(`fixed: ${row.name}`);
  }

  console.log(`Done. updated=${updated}`);
}

main();
