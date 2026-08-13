import { absoluteUrl, getSiteUrl } from "@/lib/site";

export const ORGANIZATION_ID = `${getSiteUrl()}/#organization`;
export const WEBSITE_ID = `${getSiteUrl()}/#website`;

export function organizationGraph() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": ORGANIZATION_ID,
        name: "Moon Steel Fabricators",
        legalName: "Moon Steel Fabricators",
        url: siteUrl,
        logo: absoluteUrl("/ms3-logo.svg"),
        image: absoluteUrl("/opengraph-image"),
        email: "info@moonsteelfab.com",
        telephone: "+92-21-35121145",
        description:
          "Moon Steel Fabricators is a stainless steel fabrication company based in Karachi, Pakistan, specializing in commercial kitchen equipment and custom stainless steel fabrication for hotels, restaurants, QSRs, healthcare, pharmaceutical and industrial facilities.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Plot 142, Sector 24, Korangi Industrial Area",
          addressLocality: "Karachi",
          addressRegion: "Sindh",
          addressCountry: "PK",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
        areaServed: {
          "@type": "Country",
          name: "Pakistan",
        },
        sameAs: [
          "https://www.facebook.com/moonsteelfab",
          "https://www.instagram.com/moonsteelfab/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteUrl,
        name: "Moon Steel Fabricators",
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en",
      },
    ],
  };
}

export function toAbsoluteMediaUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return absoluteUrl(value.startsWith("/") ? value : `/${value}`);
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
