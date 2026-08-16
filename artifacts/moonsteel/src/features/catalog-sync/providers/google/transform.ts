import type { NormalizedProduct } from "../../core/types";
import { primaryImage } from "../../core/validate-product";

function googleAvailability(value: NormalizedProduct["availability"]) {
  if (value === "out_of_stock") return "OUT_OF_STOCK";
  if (value === "preorder") return "PREORDER";
  return "IN_STOCK";
}

export function googleOfferId(product: NormalizedProduct) {
  return product.id.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 50) || product.sku;
}

export function toGoogleProductInput(product: NormalizedProduct, feedLabel: string) {
  const image = primaryImage(product);
  const additional = product.images.filter((item) => item.url !== image?.url).map((item) => item.url);
  const micros = Math.round((product.price ?? 0) * 1_000_000).toString();
  return {
    offerId: googleOfferId(product),
    contentLanguage: "en",
    feedLabel,
    productAttributes: {
      title: product.title.slice(0, 150),
      description: product.description.slice(0, 5000),
      link: product.canonicalUrl,
      imageLink: image?.url,
      additionalImageLinks: additional.slice(0, 10),
      availability: googleAvailability(product.availability),
      condition: "NEW",
      brand: product.brand,
      price: {
        amountMicros: micros,
        currencyCode: product.currency,
      },
      canonicalLink: product.canonicalUrl,
      productTypes: product.category ? [product.category] : undefined,
      identifierExists: false,
    },
  };
}

export function googleProductInputName(accountId: string, product: NormalizedProduct, feedLabel: string) {
  return `accounts/${accountId}/productInputs/en~${feedLabel}~${googleOfferId(product)}`;
}
