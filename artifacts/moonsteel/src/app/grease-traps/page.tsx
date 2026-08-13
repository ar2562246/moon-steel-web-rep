import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { GreaseTrapPageView } from "@/app/grease-traps/GreaseTrapPageView";
import { faqs, greaseTrapProducts, pickGreaseTrapCatalogImages } from "@/app/grease-traps/grease-traps-data";
import { getCatalogProductBySlug } from "@/features/catalog/queries";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commercial Stainless Steel Grease Traps",
  description:
    "AISI 304 stainless steel grease traps for commercial kitchens in Pakistan. Compare Small, Medium, and Large sizes and estimate required flow with the grease trap sizing calculator.",
  keywords: [
    "stainless steel grease trap",
    "commercial grease trap",
    "restaurant grease trap",
    "kitchen grease trap",
    "grease interceptor",
    "SS 304 grease trap",
    "grease trap manufacturer Pakistan",
    "grease trap Karachi",
    "custom grease trap",
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
    title: "Commercial Stainless Steel Grease Traps | Moon Steel",
    description:
      "Fabricated AISI 304 grease traps with gross tank volumes for Small, Medium, and Large commercial kitchens — plus a sizing calculator.",
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
    const supabase = await createSupabaseServerClient();
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <GreaseTrapPageView catalogImages={catalogImages} />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
