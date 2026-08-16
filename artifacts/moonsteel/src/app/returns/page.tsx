import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ReturnsPageView } from "@/app/returns/ReturnsPageView";
import { breadcrumbJsonLd, merchantReturnPolicyJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Return and refund policy",
  description:
    "Moon Steel Fabricators return and refund policy for Pakistan: 7-day returns on standard catalog products; custom made-to-spec equipment is not returnable except for damage, defects, or wrong specification.",
  alternates: {
    canonical: "/returns",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/returns"),
    title: "Return and refund policy | Moon Steel Fabricators",
    description:
      "Public return and refund policy for standard catalog products and custom stainless fabrication in Pakistan.",
  },
};

export default function ReturnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Return and refund policy", path: "/returns" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Return and refund policy",
          url: absoluteUrl("/returns"),
          dateModified: "2026-08-16",
          inLanguage: "en",
          isAccessibleForFree: true,
          about: merchantReturnPolicyJsonLd(),
        }}
      />
      <ReturnsPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
