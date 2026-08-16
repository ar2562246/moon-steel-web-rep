import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PrivacyPageView } from "@/app/privacy/PrivacyPageView";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Moon Steel Fabricators collects, uses, and shares information on moonsteelfab.com and when publishing products to Facebook, Instagram, WhatsApp Business, and Google.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    title: "Privacy Policy | Moon Steel Fabricators",
    description:
      "Public privacy policy for the Moon Steel website, quote form, and product catalogs on Meta and Google.",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy",
          url: absoluteUrl("/privacy"),
          dateModified: "2026-08-16",
        }}
      />
      <PrivacyPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
