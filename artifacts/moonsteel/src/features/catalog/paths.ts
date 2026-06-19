import type { CatalogProduct } from "@/features/catalog/types";

export function getCatalogProductPath(slug: string) {
  return `/products/${slug}`;
}

export function getCatalogCategoryFilterPath(categorySlug: string) {
  return `/products?category=${categorySlug}`;
}

export function attachProductPath(product: Omit<CatalogProduct, "path">): CatalogProduct {
  return {
    ...product,
    path: getCatalogProductPath(product.slug),
  };
}

export function getCatalogProductImages(
  product: Pick<CatalogProduct, "image_url" | "image_urls">
): string[] {
  if (product.image_urls?.length) return product.image_urls;
  if (product.image_url) return [product.image_url];
  return [];
}

export function getCatalogProductCover(
  product: Pick<CatalogProduct, "image_url" | "image_urls">
): string {
  return getCatalogProductImages(product)[0] ?? product.image_url ?? "";
}

export function normalizeCatalogProduct<T extends Omit<CatalogProduct, "path">>(
  product: T
): CatalogProduct {
  const image_urls = getCatalogProductImages(product);
  return attachProductPath({
    ...product,
    image_urls,
    image_url: image_urls[0] ?? product.image_url,
  });
}

export function toAbsoluteCatalogImageUrl(url: string, siteUrl: string): string {
  return url.startsWith("http") ? url : `${siteUrl}${url}`;
}
