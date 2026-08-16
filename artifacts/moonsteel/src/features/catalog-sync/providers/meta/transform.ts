import type { NormalizedProduct } from "../../core/types";
import { primaryImage } from "../../core/validate-product";

function metaAvailability(value: NormalizedProduct["availability"]) {
  if (value === "out_of_stock") return "out of stock";
  if (value === "preorder") return "preorder";
  if (value === "available_for_order") return "available for order";
  return "in stock";
}

function metaPrice(product: NormalizedProduct) {
  const amount = (product.price ?? 0).toFixed(2);
  return `${amount} ${product.currency}`;
}

export function toMetaCatalogItem(product: NormalizedProduct) {
  const image = primaryImage(product);
  const additional = product.images.filter((item) => item.url !== image?.url).map((item) => item.url);
  return {
    id: product.id,
    title: product.title.slice(0, 100),
    description: product.description.slice(0, 5000),
    availability: metaAvailability(product.availability),
    condition: "new",
    price: metaPrice(product),
    link: product.canonicalUrl,
    image_link: image?.url,
    additional_image_link: additional.slice(0, 20),
    brand: product.brand,
    retailer_id: product.id,
    retailer_product_group_id: product.sku,
    product_type: product.category ?? undefined,
  };
}
