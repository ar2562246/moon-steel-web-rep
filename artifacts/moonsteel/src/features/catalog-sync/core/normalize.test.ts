import { describe, expect, it } from "vitest";
import { normalizeCatalogProductForSync, toPublicImageUrl } from "./normalize";
import type { CatalogProduct } from "@/features/catalog/types";

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "prod-medium",
    slug: "stainless-steel-grease-trap-33-gpm",
    name: "Grease Trap Medium 34 GPM",
    details: "Medium grease interceptor.",
    image_url: "/images/hero-kitchen-stainless.png",
    image_urls: ["/images/hero-kitchen-stainless.png"],
    sort_order: 20,
    published: true,
    price: 150000,
    currency: "PKR",
    created_at: "",
    categories: [{ id: "cat-grease", slug: "grease-traps", name: "Grease Traps" }],
    path: "/products/stainless-steel-grease-trap-33-gpm",
    ...overrides,
  };
}

describe("normalizeCatalogProductForSync", () => {
  it("sends the live product page even when the admin is on localhost", () => {
    const normalized = normalizeCatalogProductForSync(product(), {
      siteOrigin: "http://localhost:3000",
    });
    expect(normalized.canonicalUrl).toBe(
      "https://moonsteelfab.com/products/stainless-steel-grease-trap-33-gpm"
    );
    expect(normalized.images[0]?.url).toBe("https://moonsteelfab.com/images/hero-kitchen-stainless.png");
  });
});

describe("toPublicImageUrl", () => {
  it("rewrites localhost image URLs onto the live origin", () => {
    expect(toPublicImageUrl("http://localhost:3000/images/trap.jpg", "https://moonsteelfab.com")).toBe(
      "https://moonsteelfab.com/images/trap.jpg"
    );
  });
});
