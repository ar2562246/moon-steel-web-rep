import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCatalogView } from "@/app/products/ProductCatalogView";
import {
  defaultCatalogCategories,
  defaultCatalogProducts,
  filterDefaultCatalogProducts,
} from "@/features/catalog/defaultCatalog";
import { listPublishedCatalogCategories, listPublishedCatalogProducts } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

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

  const title = active ? `${active.name} Products` : "Product Catalog";
  const description = active
    ? `Browse ${active.name.toLowerCase()} from Moon Steel — commercial stainless steel fabrication in Pakistan.`
    : "Commercial stainless steel product catalog — work tables, sinks, hoods, shelving, and custom fabrication.";

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/products?category=${category}` : "/products",
    },
    openGraph: {
      type: "website",
      url: category ? `${siteUrl}/products?category=${category}` : `${siteUrl}/products`,
      title,
      description,
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const { products, categories } = await resolveCatalog(category);

  return (
    <>
      <ProductCatalogView products={products} categories={categories} activeCategory={category} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
