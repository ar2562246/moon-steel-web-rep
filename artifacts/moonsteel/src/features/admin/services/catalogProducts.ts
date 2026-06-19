import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import {
  getCatalogProductImages,
  normalizeCatalogProduct,
} from "@/features/catalog/paths";
import { listAllCatalogProducts, listPublishedCatalogProducts } from "@/features/catalog/queries";
import type { CatalogProduct } from "@/features/catalog/types";

const BUCKET = "catalog-product-images";

function normalizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

function getStoragePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

function isStorageUrl(url: string) {
  return getStoragePathFromUrl(url) !== null;
}

async function removeStorageUrls(urls: string[]) {
  const supabase = createSupabaseBrowserClient();
  const paths = urls.map(getStoragePathFromUrl).filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}

async function uploadCatalogProductImages(files: File[]) {
  const supabase = createSupabaseBrowserClient();
  const uploaded: string[] = [];

  for (const file of files) {
    const filePath = `${crypto.randomUUID()}/${Date.now()}-${normalizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      await removeStorageUrls(uploaded);
      throw uploadError;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    uploaded.push(publicData.publicUrl);
  }

  return uploaded;
}

function normalizeSlug(slug: string, name: string) {
  const next = slugify(slug || name);
  if (!next) throw new Error("A valid product slug is required.");
  return next;
}

async function syncProductCategories(productId: string, categoryIds: string[]) {
  const supabase = createSupabaseBrowserClient();
  const { error: deleteError } = await supabase
    .from("catalog_product_categories")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (categoryIds.length === 0) return;

  const { error: insertError } = await supabase.from("catalog_product_categories").insert(
    categoryIds.map((category_id) => ({
      product_id: productId,
      category_id,
    }))
  );
  if (insertError) throw insertError;
}

type ProductPayload = {
  name: string;
  slug: string;
  details: string;
  sort_order: number;
  published: boolean;
  image_urls: string[];
  category_ids: string[];
};

function buildImageUrls(existingUrls: string[], files: File[]) {
  const trimmed = existingUrls.map((url) => url.trim()).filter(Boolean);
  if (trimmed.length === 0 && files.length === 0) {
    throw new Error("At least one product image is required.");
  }
  return { trimmed, files };
}

function productInsertPayload(payload: ProductPayload, imageUrls: string[]) {
  return {
    name: payload.name.trim(),
    slug: normalizeSlug(payload.slug, payload.name),
    details: payload.details.trim(),
    sort_order: payload.sort_order,
    published: payload.published,
    image_urls: imageUrls,
    image_url: imageUrls[0],
  };
}

export async function fetchCatalogProducts() {
  const supabase = createSupabaseBrowserClient();
  return listAllCatalogProducts(supabase);
}

export async function fetchPublishedCatalogProducts(categorySlug?: string) {
  const supabase = createSupabaseBrowserClient();
  return listPublishedCatalogProducts(supabase, categorySlug);
}

export async function createCatalogProduct(payload: ProductPayload, files: File[] = []) {
  const supabase = createSupabaseBrowserClient();
  const { trimmed } = buildImageUrls(payload.image_urls, files);
  const uploaded = files.length > 0 ? await uploadCatalogProductImages(files) : [];
  const imageUrls = [...trimmed, ...uploaded];

  const { data, error } = await supabase
    .from("catalog_products")
    .insert(productInsertPayload(payload, imageUrls))
    .select("id")
    .single();

  if (error) {
    await removeStorageUrls(uploaded);
    throw error;
  }

  await syncProductCategories(data.id, payload.category_ids);

  const rows = await listAllCatalogProducts(supabase);
  const created = rows.find((row) => row.id === data.id);
  if (!created) throw new Error("Product created but could not be loaded.");
  return created;
}

type UpdatePayload = ProductPayload & {
  id: string;
  previous_image_urls: string[];
};

export async function updateCatalogProduct(payload: UpdatePayload, files: File[] = []) {
  const supabase = createSupabaseBrowserClient();
  const { trimmed } = buildImageUrls(payload.image_urls, files);
  const uploaded = files.length > 0 ? await uploadCatalogProductImages(files) : [];
  const imageUrls = [...trimmed, ...uploaded];

  const removedStorageUrls = payload.previous_image_urls.filter(
    (url) => isStorageUrl(url) && !imageUrls.includes(url)
  );

  const { error } = await supabase
    .from("catalog_products")
    .update(productInsertPayload(payload, imageUrls))
    .eq("id", payload.id);

  if (error) {
    await removeStorageUrls(uploaded);
    throw error;
  }

  await syncProductCategories(payload.id, payload.category_ids);

  if (removedStorageUrls.length > 0) {
    await removeStorageUrls(removedStorageUrls);
  }

  const rows = await listAllCatalogProducts(supabase);
  const updated = rows.find((row) => row.id === payload.id);
  if (!updated) throw new Error("Product updated but could not be loaded.");
  return updated;
}

export async function deleteCatalogProduct(product: CatalogProduct) {
  const supabase = createSupabaseBrowserClient();
  const storageUrls = getCatalogProductImages(product).filter(isStorageUrl);
  await removeStorageUrls(storageUrls);

  const { error } = await supabase.from("catalog_products").delete().eq("id", product.id);
  if (error) throw error;
}

export { normalizeCatalogProduct };
