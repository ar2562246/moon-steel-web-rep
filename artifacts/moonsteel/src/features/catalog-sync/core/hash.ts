import { createHash } from "node:crypto";
import type { NormalizedProduct } from "./types";

export function productContentHash(product: NormalizedProduct): string {
  const snapshot = {
    title: product.title.trim(),
    description: product.description.trim(),
    sku: product.sku.trim(),
    price: product.price,
    currency: product.currency,
    availability: product.availability,
    images: product.images.map((image) => image.url),
    category: product.category,
    url: product.canonicalUrl,
    specifications: product.specifications,
    brand: product.brand,
  };
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

export function hashesMatch(left: string | null | undefined, right: string | null | undefined) {
  return Boolean(left && right && left === right);
}
