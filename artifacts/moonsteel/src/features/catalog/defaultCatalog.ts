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
  {
    id: "default-grease-trap-large",
    slug: "grease-trap-large",
    name: "Grease Trap Large 120 GPM",
    details:
      "Large grease interceptor that separates fats, oils, and grease from kitchen wastewater.\n\nSpecifications\n• Size: 48″ × 24″ × 24″\n• Flow: 120 GPM\n• Gross tank volume: ~119.7 gal / 453 L\n• Material: 1.50mm AISI 304\n• Inlet: 4″\n• Outlet: 4″\n• Internals: 2× buckets, 2× compartments\n\nSuitable for hotels, catering, and high-volume kitchens. Custom sizes available on request.",
    image_url: "",
    image_urls: [],
    sort_order: 10,
    published: true,
    created_at: "",
    categories: [{ id: "cat-grease", slug: "grease-traps", name: "Grease Traps & Interceptors" }],
    path: "/products/grease-trap-large",
  },
  {
    id: "default-grease-trap-medium",
    slug: "stainless-steel-grease-trap-33-gpm",
    name: "Grease Trap Medium 34 GPM",
    details:
      "Medium grease interceptor that separates fats, oils, and grease from kitchen wastewater.\n\nSpecifications\n• Size: 24″ × 18″ × 18″\n• Flow: 34 GPM\n• Gross tank volume: ~33.7 gal / 128 L\n• Material: 1.50mm AISI 304\n• Inlet: 3″\n• Outlet: 3″\n• Internals: 1× bucket, 1× baffle\n\nSuitable for restaurants and moderate commercial kitchens. Custom sizes available on request.",
    image_url: "",
    image_urls: [],
    sort_order: 20,
    published: true,
    created_at: "",
    categories: [{ id: "cat-grease", slug: "grease-traps", name: "Grease Traps & Interceptors" }],
    path: "/products/stainless-steel-grease-trap-33-gpm",
  },
  {
    id: "default-grease-trap-small",
    slug: "grease-trap-grease-interceptor",
    name: "Grease Trap Small 17 GPM",
    details:
      "Small grease interceptor that separates fats, oils, and grease from kitchen wastewater.\n\nSpecifications\n• Size: 22″ × 15″ × 12″\n• Flow: 17 GPM\n• Gross tank volume: ~17.1 gal / 65 L\n• Material: 1.50mm AISI 304\n• Inlet: 1″\n• Outlet: 2″\n• Internals: 1× bucket, 1× baffle\n• Grease holding capacity: 9.5 kg\n\nSuitable for cafés and light-duty sinks. Custom sizes available on request.",
    image_url: "",
    image_urls: [],
    sort_order: 30,
    published: true,
    created_at: "",
    categories: [{ id: "cat-grease", slug: "grease-traps", name: "Grease Traps & Interceptors" }],
    path: "/products/grease-trap-grease-interceptor",
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
