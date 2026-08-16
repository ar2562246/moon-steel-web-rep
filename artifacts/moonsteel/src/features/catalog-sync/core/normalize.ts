import { absoluteUrl } from "@/lib/site";
import { getCatalogProductImages, getCatalogProductPath } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";
import type { NormalizedProduct, ProductAvailability } from "./types";

export const DEFAULT_BRAND = "Moon Steel Fabricators";
export const DEFAULT_CURRENCY = "PKR";

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function toPublicImageUrl(url: string, siteOrigin?: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (isHttpUrl(trimmed)) return trimmed;
  const origin = siteOrigin || "";
  if (!origin) return trimmed;
  return `${origin.replace(/\/+$/, "")}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function normalizeCatalogProductForSync(
  product: CatalogProduct,
  options: { siteOrigin?: string } = {}
): NormalizedProduct {
  const origin = options.siteOrigin;
  const images = getCatalogProductImages(product)
    .map((url, index) => ({
      url: toPublicImageUrl(url, origin),
      isPrimary: index === 0,
    }))
    .filter((image) => image.url.length > 0);

  const availability: ProductAvailability =
    product.availability ?? (product.published ? "in_stock" : "out_of_stock");

  return {
    id: product.id,
    title: product.name.trim(),
    description: product.details.trim(),
    sku: (product.sku?.trim() || product.slug).trim(),
    price: product.price ?? null,
    currency: (product.currency || DEFAULT_CURRENCY).toUpperCase(),
    availability,
    canonicalUrl: absoluteUrl(getCatalogProductPath(product.slug)),
    images,
    category: product.categories[0]?.name ?? null,
    brand: DEFAULT_BRAND,
    specifications: {},
    metadata: {
      slug: product.slug,
      published: product.published ? "true" : "false",
    },
  };
}
