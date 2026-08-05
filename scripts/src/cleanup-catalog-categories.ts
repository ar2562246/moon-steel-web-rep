/**
 * Clean up catalog categories after WooCommerce import.
 *
 * - Unpublish seed demo products that duplicate real WP products
 * - Merge/rename WooCommerce categories into a clear shop taxonomy
 * - Reassign misfiled "Others" / "Drawer" products
 * - Delete unused empty categories
 *
 * Usage:
 *   corepack pnpm --filter @workspace/scripts run cleanup:catalog-categories
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

config({ path: path.join(repoRoot, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Final shop taxonomy (display name → sort order) */
const TARGET_CATEGORIES: { name: string; sort_order: number }[] = [
  { name: "Sinks", sort_order: 10 },
  { name: "Work Tables", sort_order: 20 },
  { name: "Counters", sort_order: 30 },
  { name: "Cabinets", sort_order: 40 },
  { name: "Trolleys", sort_order: 50 },
  { name: "Serving Lines", sort_order: 60 },
  { name: "Exhaust Hoods", sort_order: 70 },
  { name: "Grease Traps", sort_order: 80 },
  { name: "Racks & Shelving", sort_order: 90 },
  { name: "Drains", sort_order: 100 },
  { name: "Cooking Equipment", sort_order: 110 },
  { name: "Utensils & Accessories", sort_order: 120 },
  { name: "Specialty Systems", sort_order: 130 },
];

/**
 * Map any existing category name/slug → target category name.
 * Products linked to old names get remapped.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  sink: "Sinks",
  sinks: "Sinks",
  "commercial sink units": "Sinks",
  "commercial-sinks": "Sinks",
  table: "Work Tables",
  "work tables": "Work Tables",
  "work-tables": "Work Tables",
  "work tables & prep stations": "Work Tables",
  counter: "Counters",
  counters: "Counters",
  cabinet: "Cabinets",
  cabinets: "Cabinets",
  trolley: "Trolleys",
  trolleys: "Trolleys",
  "trolleys & dispensers": "Trolleys",
  "trolleys-dispensers": "Trolleys",
  "serving line": "Serving Lines",
  "serving lines": "Serving Lines",
  hood: "Exhaust Hoods",
  "exhaust hoods": "Exhaust Hoods",
  "exhaust-hoods": "Exhaust Hoods",
  "exhaust hoods & ventilation": "Exhaust Hoods",
  "grease trap": "Grease Traps",
  "grease traps": "Grease Traps",
  "grease-trap": "Grease Traps",
  "grease-traps": "Grease Traps",
  "grease traps & interceptors": "Grease Traps",
  rack: "Racks & Shelving",
  shelf: "Racks & Shelving",
  "racks & shelving": "Racks & Shelving",
  "shelving & storage": "Racks & Shelving",
  "shelving-storage": "Racks & Shelving",
  drain: "Drains",
  drains: "Drains",
  fryer: "Cooking Equipment",
  "hot cooking": "Cooking Equipment",
  "hot-cooking": "Cooking Equipment",
  "cooking equipment": "Cooking Equipment",
  utensils: "Utensils & Accessories",
  "utensils & accessories": "Utensils & Accessories",
  others: "Specialty Systems",
  "specialty systems": "Specialty Systems",
  drawer: "Counters", // weak WC tag — fold into Counters
};

/** Per-product overrides (slug → exclusive category names) */
const PRODUCT_CATEGORY_OVERRIDES: Record<string, string[]> = {
  "hand-wash-sink": ["Sinks"],
  "mop-sink": ["Sinks"],
  "double-bowl-sink-table": ["Sinks", "Work Tables"],
  "single-bowl-sink-table": ["Sinks", "Work Tables"],
  "triple-bowl-sink-table": ["Sinks", "Work Tables"],
  "counter-with-sink": ["Counters", "Sinks"],
  "work-table-without-under-shelf": ["Work Tables"],
  "work-table-with-1-under-shelf": ["Work Tables"],
  "work-table-with-2-under-shelves": ["Work Tables"],
  "work-table-with-1-under-shelf-and-1-over-shelf": ["Work Tables"],
  "work-table-with-2-under-shelf-and-2-over-shelf": ["Work Tables"],
  trolley: ["Trolleys"],
  "platform-trolley": ["Trolleys"],
  "double-tray-trolley": ["Trolleys"],
  "single-tray-trolley": ["Trolleys"],
  "s-s-service-trolley": ["Trolleys"],
  "counter-with-sliding-doors": ["Counters"],
  "counter-with-flap-doors": ["Counters"],
  "counter-with-4-drawers-and-flap-doors": ["Counters"],
  "wall-cabinet-with-sliding-doors": ["Cabinets"],
  "wall-cabinet-with-flap-doors": ["Cabinets"],
  "counter-with-tray-slider": ["Serving Lines", "Counters"],
  "cutlery-counter-with-tray-slider": ["Serving Lines", "Counters"],
  "cold-bin-marie": ["Serving Lines", "Counters"],
  "hot-bin-marie": ["Serving Lines", "Counters"],
  "self-service-line": ["Serving Lines"],
  "s-s-dispenser": ["Serving Lines", "Utensils & Accessories"],
  "exhaust-hood-wall-mounted": ["Exhaust Hoods"],
  "exhaust-hood-island-type": ["Exhaust Hoods"],
  "grease-trap-grease-interceptor": ["Grease Traps"],
  "stainless-steel-grease-trap-33-gpm": ["Grease Traps"],
  "corner-shelf": ["Racks & Shelving"],
  "net-rack-for-cold-room": ["Racks & Shelving"],
  "racks-for-storage": ["Racks & Shelving"],
  "drain-channel": ["Drains"],
  "floor-grating-drain-channel": ["Drains"],
  "fryer-custom-made": ["Cooking Equipment"],
  "stainless-steel-stock-pot-stove": ["Cooking Equipment"],
  "stainless-steel-tong": ["Utensils & Accessories"],
  "trash-garbage-and-linen-chutes-and-chute-systems": ["Specialty Systems"],
  "stainless-steel-cylindrical-container-25-dia-x-32-height-with-half-open-lid-heavy-duty-hinges": [
    "Specialty Systems",
  ],
};

/** Seed demo products from defaultCatalog — unpublish (duplicates real WP items) */
const SEED_PRODUCT_SLUGS = [
  "stainless-steel-work-table",
  "triple-bowl-commercial-sink",
  "canopy-exhaust-hood",
];

async function ensureTargetCategories() {
  const idByName = new Map<string, string>();

  for (const cat of TARGET_CATEGORIES) {
    const slug = slugify(cat.name);
    const { data: existing, error: findError } = await supabase
      .from("catalog_categories")
      .select("id,name")
      .eq("slug", slug)
      .maybeSingle();
    if (findError) throw findError;

    if (existing?.id) {
      const { error } = await supabase
        .from("catalog_categories")
        .update({
          name: cat.name,
          sort_order: cat.sort_order,
          published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
      idByName.set(cat.name, existing.id);
      console.log(`Category OK (update): ${cat.name}`);
    } else {
      const { data, error } = await supabase
        .from("catalog_categories")
        .insert({
          name: cat.name,
          slug,
          sort_order: cat.sort_order,
          published: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      idByName.set(cat.name, data.id);
      console.log(`Category OK (create): ${cat.name}`);
    }
  }

  return idByName;
}

function resolveTargetName(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? CATEGORY_ALIASES[slugify(raw)] ?? null;
}

async function main() {
  console.log("Ensuring target categories...");
  const idByName = await ensureTargetCategories();

  console.log("\nUnpublishing seed demo products...");
  for (const slug of SEED_PRODUCT_SLUGS) {
    const { data, error } = await supabase
      .from("catalog_products")
      .update({ published: false, updated_at: new Date().toISOString() })
      .eq("slug", slug)
      .select("id,name");
    if (error) throw error;
    if (data?.length) console.log(`  unpublished: ${data[0].name}`);
    else console.log(`  skip (not found): ${slug}`);
  }

  const { data: products, error: pErr } = await supabase
    .from("catalog_products")
    .select(
      `
      id,slug,name,published,
      catalog_product_categories (
        catalog_categories ( id, slug, name )
      )
    `,
    )
    .order("sort_order");
  if (pErr) throw pErr;

  console.log("\nReassigning product categories...");
  for (const product of products ?? []) {
    if (SEED_PRODUCT_SLUGS.includes(product.slug)) continue;

    let targetNames = PRODUCT_CATEGORY_OVERRIDES[product.slug];

    if (!targetNames) {
      const current = (product.catalog_product_categories || [])
        .flatMap((row: { catalog_categories: { name: string } | { name: string }[] | null }) => {
          const c = row.catalog_categories;
          if (!c) return [];
          return Array.isArray(c) ? c : [c];
        })
        .map((c) => c.name);

      const mapped = [
        ...new Set(current.map(resolveTargetName).filter((n): n is string => Boolean(n))),
      ];
      targetNames = mapped.length > 0 ? mapped : ["Specialty Systems"];
    }

    const categoryIds = targetNames
      .map((name) => idByName.get(name))
      .filter((id): id is string => Boolean(id));

    await supabase.from("catalog_product_categories").delete().eq("product_id", product.id);

    if (categoryIds.length > 0) {
      const { error: linkError } = await supabase.from("catalog_product_categories").insert(
        categoryIds.map((category_id) => ({
          product_id: product.id,
          category_id,
        })),
      );
      if (linkError) throw linkError;
    }

    console.log(`  ${product.name} → ${targetNames.join(", ")}`);
  }

  console.log("\nDeleting obsolete empty categories...");
  const keepSlugs = new Set(TARGET_CATEGORIES.map((c) => slugify(c.name)));
  const { data: allCats, error: cErr } = await supabase
    .from("catalog_categories")
    .select("id,name,slug");
  if (cErr) throw cErr;

  for (const cat of allCats ?? []) {
    if (keepSlugs.has(cat.slug)) continue;

    const { count } = await supabase
      .from("catalog_product_categories")
      .select("*", { count: "exact", head: true })
      .eq("category_id", cat.id);

    if ((count ?? 0) > 0) {
      console.log(`  keep linked leftover "${cat.name}" (${count} links) — remapping missed?`);
      continue;
    }

    const { error } = await supabase.from("catalog_categories").delete().eq("id", cat.id);
    if (error) {
      console.warn(`  could not delete ${cat.name}: ${error.message}`);
    } else {
      console.log(`  deleted: ${cat.name}`);
    }
  }

  // Final report
  const { data: finalCats } = await supabase
    .from("catalog_categories")
    .select("id,name,slug,sort_order,published")
    .order("sort_order");

  const { data: finalProducts } = await supabase
    .from("catalog_products")
    .select(
      `
      name,slug,published,
      catalog_product_categories ( catalog_categories ( name ) )
    `,
    )
    .eq("published", true)
    .order("sort_order");

  const byCat = new Map<string, string[]>();
  for (const c of finalCats ?? []) byCat.set(c.name, []);
  for (const p of finalProducts ?? []) {
    const names = (p.catalog_product_categories || [])
      .flatMap((row: { catalog_categories: { name: string } | { name: string }[] | null }) => {
        const c = row.catalog_categories;
        if (!c) return [];
        return Array.isArray(c) ? c : [c];
      })
      .map((c) => c.name);
    if (names.length === 0) {
      if (!byCat.has("(uncategorized)")) byCat.set("(uncategorized)", []);
      byCat.get("(uncategorized)")!.push(p.name);
    }
    for (const n of names) {
      if (!byCat.has(n)) byCat.set(n, []);
      byCat.get(n)!.push(p.name);
    }
  }

  console.log("\n=== Final catalog taxonomy ===");
  console.log(`Published products: ${finalProducts?.length ?? 0}`);
  console.log(`Categories: ${finalCats?.length ?? 0}`);
  for (const c of finalCats ?? []) {
    const list = byCat.get(c.name) || [];
    console.log(`\n${c.name} (${list.length})`);
    for (const name of list) console.log(`  - ${name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
