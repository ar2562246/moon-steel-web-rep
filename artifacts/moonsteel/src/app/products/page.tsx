import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCatalogView } from "@/app/products/ProductCatalogView";
import {
  defaultCatalogCategories,
  filterDefaultCatalogProducts,
} from "@/features/catalog/defaultCatalog";
import { listPublishedCatalogCategories, listPublishedCatalogProducts } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

async function resolveCatalog(categorySlug?: string) {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const [products, categories] = await Promise.all([
        listPublishedCatalogProducts(supabase, categorySlug),
        listPublishedCatalogCategories(supabase),
      ]);
      if (products.length > 0 || categories.length > 0) {
        return { products, categories };
      }
    } catch {
      // Fall through to defaults.
    }
  }

  return {
    products: filterDefaultCatalogProducts(categorySlug),
    categories: defaultCatalogCategories,
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const { categories } = await resolveCatalog(category);
  const active = categories.find((item) => item.slug === category);

  const title = active ? active.name : "Commercial Stainless Steel Kitchen Equipment";
  const description = active
    ? `${active.name} fabricated in AISI 304 and AISI 316 stainless steel by Moon Steel Fabricators.`
    : "Commercial stainless steel kitchen equipment — work tables, sinks, hoods, shelving, and custom fabrication.";

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/products?category=${category}` : "/products",
    },
    openGraph: {
      type: "website",
      url: category ? absoluteUrl(`/products?category=${category}`) : absoluteUrl("/products"),
      title,
      description,
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const { products, categories } = await resolveCatalog(category);
  const active = categories.find((item) => item.slug === category);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          ...(active ? [{ name: active.name, path: `/products?category=${active.slug}` }] : []),
        ])}
      />
      <ProductCatalogView products={products} categories={categories} activeCategory={category} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
