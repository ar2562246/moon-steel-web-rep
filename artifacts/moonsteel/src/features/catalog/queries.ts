import type { SupabaseClient } from "@supabase/supabase-js";
import {
  attachProductPath,
  getCatalogProductImages,
  normalizeCatalogProduct,
} from "@/features/catalog/paths";
import {
  CATALOG_CATEGORY_SELECT,
  CATALOG_PRODUCT_SELECT,
  type CatalogCategory,
  type CatalogCategorySummary,
  type CatalogProduct,
  type CatalogProductRow,
} from "@/features/catalog/types";

function extractCategories(
  links: CatalogProductRow["catalog_product_categories"]
): CatalogCategorySummary[] {
  if (!links?.length) return [];

  const categories: CatalogCategorySummary[] = [];
  for (const link of links) {
    const raw = link.catalog_categories;
    if (!raw) continue;
    const items = Array.isArray(raw) ? raw : [raw];
    for (const category of items) {
      if (category?.id && !categories.some((item) => item.id === category.id)) {
        categories.push({ id: category.id, slug: category.slug, name: category.name });
      }
    }
  }
  return categories;
}

function normalizeProductRow(row: CatalogProductRow): CatalogProduct {
  const { catalog_product_categories, ...rest } = row;
  const categories = extractCategories(catalog_product_categories);
  return normalizeCatalogProduct({
    ...rest,
    categories,
  });
}

function normalizeProductRows(rows: CatalogProductRow[]) {
  return rows.map(normalizeProductRow);
}

export async function listPublishedCatalogCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("catalog_categories")
    .select(CATALOG_CATEGORY_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CatalogCategory[];
}

export async function listAllCatalogCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("catalog_categories")
    .select(CATALOG_CATEGORY_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CatalogCategory[];
}

export async function listPublishedCatalogProducts(
  supabase: SupabaseClient,
  categorySlug?: string
) {
  if (categorySlug) {
    const { data: category, error: categoryError } = await supabase
      .from("catalog_categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("published", true)
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) return [] as CatalogProduct[];

    const { data, error } = await supabase
      .from("catalog_products")
      .select(
        `
        id,slug,name,details,image_url,image_urls,sort_order,published,created_at,updated_at,
        catalog_product_categories!inner (
          category_id,
          catalog_categories (
            id, slug, name
          )
        )
      `
      )
      .eq("published", true)
      .eq("catalog_product_categories.category_id", category.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return normalizeProductRows((data ?? []) as CatalogProductRow[]);
  }

  const { data, error } = await supabase
    .from("catalog_products")
    .select(CATALOG_PRODUCT_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeProductRows((data ?? []) as CatalogProductRow[]);
}

export async function listAllCatalogProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(CATALOG_PRODUCT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeProductRows((data ?? []) as CatalogProductRow[]);
}

export async function getCatalogProductBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("catalog_products")
    .select(CATALOG_PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeProductRow(data as CatalogProductRow) : null;
}

export async function listPublishedCatalogProductSlugs(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("catalog_products")
    .select("slug,updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { slug: string; updated_at: string }[];
}

export async function listProductsByCategoryId(supabase: SupabaseClient, categoryId: string) {
  const { data, error } = await supabase
    .from("catalog_product_categories")
    .select(
      `
      catalog_products (
        ${CATALOG_PRODUCT_SELECT}
      )
    `
    )
    .eq("category_id", categoryId);

  if (error) throw error;

  const products = (data ?? [])
    .map((row) => {
      const raw = row.catalog_products as CatalogProductRow | CatalogProductRow[] | null;
      if (!raw) return null;
      return Array.isArray(raw) ? raw[0] : raw;
    })
    .filter((row): row is CatalogProductRow => Boolean(row))
    .map(normalizeProductRow);

  return products.sort((a, b) => a.sort_order - b.sort_order);
}

export function productMatchesCategory(product: CatalogProduct, categorySlug?: string) {
  if (!categorySlug) return true;
  return product.categories.some((category) => category.slug === categorySlug);
}

export { getCatalogProductImages, attachProductPath };
