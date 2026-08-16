import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TermsPageView } from "@/app/terms/TermsPageView";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Website terms, custom fabrication quotes, returns, and catalog listings for Moon Steel Fabricators.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/terms"),
    title: "Terms of Use | Moon Steel Fabricators",
    description: "Quotes, custom work, delivery, and catalog listings for Moon Steel Fabricators.",
  },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms of Use", path: "/terms" },
        ])}
      />
      <TermsPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
