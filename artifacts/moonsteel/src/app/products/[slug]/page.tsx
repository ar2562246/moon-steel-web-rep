import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/app/products/[slug]/ProductDetailView";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getDefaultCatalogProductBySlug } from "@/features/catalog/defaultCatalog";
import {
  getCatalogProductImages,
  getCatalogProductPath,
  normalizeCatalogProduct,
  toAbsoluteCatalogImageUrl,
} from "@/features/catalog/paths";
import { getCatalogProductBySlug, listPublishedCatalogProductSlugs } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveProduct(slug: string) {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const product = await getCatalogProductBySlug(supabase, slug);
      if (product) return product;
    } catch {
      // Fall through to defaults.
    }
  }

  const fallback = getDefaultCatalogProductBySlug(slug);
  return fallback ? normalizeCatalogProduct(fallback) : null;
}

export async function generateStaticParams() {
  const { defaultCatalogProducts } = await import("@/features/catalog/defaultCatalog");

  if (!hasSupabaseServerEnv()) {
    return defaultCatalogProducts.map((product) => ({ slug: product.slug }));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const rows = await listPublishedCatalogProductSlugs(supabase);
    if (rows.length > 0) return rows.map((row) => ({ slug: row.slug }));
  } catch {
    // Fall back below.
  }

  return defaultCatalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }

  const description = product.details.slice(0, 160);
  const images = getCatalogProductImages(product);
  const cover = images[0] ?? product.image_url;
  const ogImages = images.map((url) => ({
    url: toAbsoluteCatalogImageUrl(url, siteUrl),
    alt: product.name,
  }));

  return {
    title: product.name,
    description,
    alternates: { canonical: getCatalogProductPath(product.slug) },
    openGraph: {
      type: "website",
      url: `${siteUrl}${product.path}`,
      title: product.name,
      description,
      images: ogImages.length > 0 ? ogImages : [{ url: toAbsoluteCatalogImageUrl(cover, siteUrl), alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [toAbsoluteCatalogImageUrl(cover, siteUrl)],
    },
  };
}

export default async function CatalogProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (!product) notFound();

  const images = getCatalogProductImages(product).map((url) => toAbsoluteCatalogImageUrl(url, siteUrl));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.details,
    image: images.length > 0 ? images : undefined,
    url: `${siteUrl}${product.path}`,
    category: product.categories.map((category) => category.name).join(", "),
    brand: {
      "@type": "Brand",
      name: "Moon Steel",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Moon Steel",
      url: siteUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailView product={product} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
