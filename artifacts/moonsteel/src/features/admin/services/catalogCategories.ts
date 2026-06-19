import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { listAllCatalogCategories } from "@/features/catalog/queries";
import type { CatalogCategory } from "@/features/catalog/types";

export async function fetchCatalogCategories() {
  const supabase = createSupabaseBrowserClient();
  return listAllCatalogCategories(supabase);
}

type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  published: boolean;
};

function normalizeSlug(slug: string, name: string) {
  const next = slugify(slug || name);
  if (!next) throw new Error("A valid category slug is required.");
  return next;
}

export async function createCatalogCategory(payload: CategoryPayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("catalog_categories")
    .insert({
      name: payload.name.trim(),
      slug: normalizeSlug(payload.slug, payload.name),
      description: payload.description?.trim() || null,
      sort_order: payload.sort_order,
      published: payload.published,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CatalogCategory;
}

type UpdateCategoryPayload = CategoryPayload & { id: string };

export async function updateCatalogCategory(payload: UpdateCategoryPayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("catalog_categories")
    .update({
      name: payload.name.trim(),
      slug: normalizeSlug(payload.slug, payload.name),
      description: payload.description?.trim() || null,
      sort_order: payload.sort_order,
      published: payload.published,
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw error;
  return data as CatalogCategory;
}

export async function deleteCatalogCategory(id: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("catalog_categories").delete().eq("id", id);
  if (error) throw error;
}
