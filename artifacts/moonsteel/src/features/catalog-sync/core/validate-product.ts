import type { NormalizedProduct, ValidationIssue } from "./types";

const HTTP = /^https?:\/\//i;

export function commonCatalogIssues(
  product: NormalizedProduct,
  options: { requirePrice: boolean; requireHttpsImage: boolean }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!product.title.trim()) {
    issues.push({ field: "title", message: "Product name is required.", fatal: true });
  }
  if (!product.description.trim()) {
    issues.push({ field: "description", message: "Product description is required.", fatal: true });
  }
  if (!product.sku.trim()) {
    issues.push({ field: "sku", message: "SKU or slug is required.", fatal: true });
  }
  if (!product.canonicalUrl || !HTTP.test(product.canonicalUrl)) {
    issues.push({ field: "url", message: "A public product URL is required.", fatal: true });
  }
  if (product.images.length === 0) {
    issues.push({ field: "images", message: "At least one product image is required.", fatal: true });
  } else if (options.requireHttpsImage) {
    const invalid = product.images.filter((image) => !HTTP.test(image.url));
    if (invalid.length > 0) {
      issues.push({
        field: "images",
        message: "Catalog images must be publicly reachable HTTP(S) URLs.",
        fatal: true,
      });
    }
  }
  if (options.requirePrice && (product.price == null || product.price < 0)) {
    issues.push({
      field: "price",
      message: "This platform requires a price. Add a catalog price on the product, then sync.",
      fatal: true,
    });
  }
  return issues;
}

export function primaryImage(product: NormalizedProduct) {
  return product.images.find((image) => image.isPrimary) ?? product.images[0];
}
