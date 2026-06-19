import type { CatalogCategorySummary, CatalogProduct } from "@/features/catalog/types";
import { normalizeCatalogProduct } from "@/features/catalog/paths";

export const defaultCatalogProducts: CatalogProduct[] = [
  {
    id: "default-work-table",
    slug: "stainless-steel-work-table",
    name: "Stainless Steel Work Table",
    details:
      "SS 304 work table with reinforced under-bracing, adjustable bullet feet, and optional splashbacks. Built for high-volume commercial kitchens.",
    image_url: "/images/hero-kitchen-stainless.png",
    image_urls: ["/images/hero-kitchen-stainless.png"],
    sort_order: 10,
    published: true,
    created_at: "",
    categories: [{ id: "cat-work-tables", slug: "work-tables", name: "Work Tables & Prep Stations" }],
    path: "/products/stainless-steel-work-table",
  },
  {
    id: "default-triple-sink",
    slug: "triple-bowl-commercial-sink",
    name: "Triple Bowl Commercial Sink",
    details:
      "Fully welded SS 304 triple compartment sink with deep-drawn bowls, radiused corners, and integrated drainboards.",
    image_url: "/images/hero-kitchen-stainless.png",
    image_urls: ["/images/hero-kitchen-stainless.png"],
    sort_order: 20,
    published: true,
    created_at: "",
    categories: [{ id: "cat-sinks", slug: "commercial-sinks", name: "Commercial Sink Units" }],
    path: "/products/triple-bowl-commercial-sink",
  },
  {
    id: "default-canopy-hood",
    slug: "canopy-exhaust-hood",
    name: "Canopy Exhaust Hood",
    details:
      "SS 304/430 canopy hood with baffle filters, grease cups, and integrated lighting for restaurant cooklines.",
    image_url: "/images/hero-kitchen-stainless.png",
    image_urls: ["/images/hero-kitchen-stainless.png"],
    sort_order: 30,
    published: true,
    created_at: "",
    categories: [{ id: "cat-hoods", slug: "exhaust-hoods", name: "Exhaust Hoods & Ventilation" }],
    path: "/products/canopy-exhaust-hood",
  },
];

export const defaultCatalogCategories: CatalogCategorySummary[] = [
  { id: "cat-work-tables", slug: "work-tables", name: "Work Tables & Prep Stations" },
  { id: "cat-sinks", slug: "commercial-sinks", name: "Commercial Sink Units" },
  { id: "cat-hoods", slug: "exhaust-hoods", name: "Exhaust Hoods & Ventilation" },
  { id: "cat-shelving", slug: "shelving-storage", name: "Shelving & Storage" },
  { id: "cat-grease", slug: "grease-traps", name: "Grease Traps & Interceptors" },
  { id: "cat-trolleys", slug: "trolleys-dispensers", name: "Trolleys & Dispensers" },
];

export function getDefaultCatalogProductBySlug(slug: string) {
  const product = defaultCatalogProducts.find((item) => item.slug === slug);
  return product ? normalizeCatalogProduct(product) : null;
}

export function filterDefaultCatalogProducts(categorySlug?: string) {
  if (!categorySlug) return defaultCatalogProducts;
  return defaultCatalogProducts.filter((product) =>
    product.categories.some((category) => category.slug === categorySlug)
  );
}
