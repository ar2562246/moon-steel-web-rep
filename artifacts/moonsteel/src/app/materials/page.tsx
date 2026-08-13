import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MaterialsPageView } from "@/app/materials/MaterialsPageView";
import { faqs } from "@/app/materials/materials-data";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stainless Steel Grades for Commercial Kitchens",
  description:
    "Interactive stainless steel grade guide for commercial kitchens: AISI 304 vs 316, thickness, finishes, chemistry, and how to choose the right material. Mill certificates available.",
  keywords: [
    "stainless steel grades",
    "AISI 304",
    "AISI 316",
    "SS304 vs SS316",
    "commercial kitchen stainless steel",
    "food grade stainless steel",
    "is 304 stainless steel food grade",
    "stainless steel thickness for tables",
  ],
  alternates: {
    canonical: "/materials",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/materials"),
    title: "Stainless Steel Grades for Commercial Kitchens | Moon Steel Fabricators",
    description:
      "Choose AISI 304 or 316 with interactive tools, comparison cards, thickness guide, and mill-certified fabrication guidance.",
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

export default function MaterialsPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Materials", path: "/materials" },
        ])}
      />
      <MaterialsPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
