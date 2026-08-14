import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { GreaseTrapPageView } from "@/app/grease-traps/GreaseTrapPageView";
import { faqs, greaseTrapProducts, pickGreaseTrapCatalogImages } from "@/app/grease-traps/grease-traps-data";
import { getCatalogProductBySlug } from "@/features/catalog/queries";
import { createSupabasePublicClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";
import { getCatalogProductPath } from "@/features/catalog/paths";

export const metadata: Metadata = {
  title: "Stainless Steel Grease Trap Manufacturer in Pakistan",
  description:
    "Moon Steel manufactures AISI 304 stainless steel grease traps in Karachi and supplies them across Pakistan. Standard Small, Medium, and Large sizes, or custom tanks built from customer and consultant drawings.",
  keywords: [
    "stainless steel grease trap",
    "commercial grease trap",
    "restaurant grease trap",
    "kitchen grease trap",
    "grease interceptor",
    "SS 304 grease trap",
    "grease trap manufacturer Pakistan",
    "grease trap Karachi",
    "grease interceptor Pakistan",
    "custom grease trap from drawings",
    "grease trap sizing",
    "grease trap capacity",
    "grease trap size calculator",
  ],
  alternates: {
    canonical: "/grease-traps",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/grease-traps"),
    title: "Stainless Steel Grease Trap Manufacturer in Pakistan | Moon Steel Fabricators",
    description:
      "AISI 304 grease traps manufactured in Karachi — standard 17 / 34 / 120 GPM sizes, or built to your consultant drawing.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

async function resolveCatalogImages() {
  if (!hasSupabaseServerEnv()) return {};

  try {
    const supabase = createSupabasePublicClient();
    const rows = await Promise.all(
      greaseTrapProducts.map((item) => getCatalogProductBySlug(supabase, item.slug)),
    );

    return pickGreaseTrapCatalogImages(
      rows.filter((product): product is NonNullable<typeof product> => Boolean(product)),
    );
  } catch {
    return {};
  }
}

export default async function GreaseTrapsPage() {
  const catalogImages = await resolveCatalogImages();

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Stainless steel grease traps manufactured in Pakistan",
          itemListElement: greaseTrapProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            url: absoluteUrl(getCatalogProductPath(product.slug)),
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: "Grease Traps", path: "/grease-traps" },
        ])}
      />
      <GreaseTrapPageView catalogImages={catalogImages} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
