import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ContactForm } from "@/components/sections/ContactForm";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Request a stainless steel fabrication quote from Moon Steel in Karachi. Call, email, WhatsApp, or send project details for a response within 24 hours.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact"),
    title: "Contact Us | Moon Steel Fabricators",
    description:
      "Get a custom fabrication quote for commercial kitchens, hospitals, and industrial stainless equipment.",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Moon Steel Fabricators",
          url: absoluteUrl("/contact"),
        }}
      />
      <ContactForm standalone />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
