import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AboutPageView } from "@/app/about/AboutPageView";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Moon Steel Fabricators is a three-generation family business in Karachi, fabricating customized stainless steel equipment for commercial kitchens, hospitals, and laboratories since 1947.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    title: "About Us | Moon Steel",
    description:
      "Three generations of stainless steel fabrication in Karachi — from Ghulam Haider in 1947 to Muhammad Suleman and his sons today.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Moon Steel Fabricators",
  url: siteUrl,
  foundingDate: "1947",
  description:
    "Pioneers in stainless steel fabrication in Pakistan — customized equipment for commercial kitchens, laboratories, hotels, and hospitals.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Plot 142, Sector 24, Korangi Industrial Area",
    addressLocality: "Karachi",
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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <AboutPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
