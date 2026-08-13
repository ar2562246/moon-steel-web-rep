import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AboutPageView } from "@/app/about/AboutPageView";
import { breadcrumbJsonLd, ORGANIZATION_ID } from "@/lib/json-ld";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Stainless Steel Fabricators in Karachi Since 1947",
  description:
    "Moon Steel Fabricators is a three-generation family business in Karachi, fabricating customized stainless steel equipment for commercial kitchens, hospitals, and laboratories since 1947.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    title: "Stainless Steel Fabricators in Karachi Since 1947 | Moon Steel Fabricators",
    description:
      "Three generations of stainless steel fabrication in Karachi — from Ghulam Haider in 1947 to Muhammad Suleman and his sons today.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "Moon Steel Fabricators",
  url: siteUrl,
  foundingDate: "1947",
  description:
    "Family stainless steel fabrication business in Karachi — customized equipment for commercial kitchens, laboratories, hotels, and hospitals.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Plot 142, Sector 24, Korangi Industrial Area",
    addressLocality: "Karachi",
    addressRegion: "Sindh",
    addressCountry: "PK",
  },
  telephone: "+92-21-35121145",
  email: "info@moonsteelfab.com",
  employee: [
    {
      "@type": "Person",
      name: "Muhammad Suleman",
      jobTitle: "Chief Executive Officer",
      image: absoluteUrl("/images/team/muhammad-suleman.jpg"),
    },
    {
      "@type": "Person",
      name: "Ovais Suleman",
      jobTitle: "Sales and Project Management",
      image: absoluteUrl("/images/team/ovais-suleman.jpg"),
    },
    {
      "@type": "Person",
      name: "Abdul Rahman",
      jobTitle: "Business Development",
      image: absoluteUrl("/images/team/abdul-rahman.jpg"),
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <AboutPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
