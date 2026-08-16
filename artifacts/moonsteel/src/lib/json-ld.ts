import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { GOOGLE_MAPS_HREF } from "@/lib/contact/details";

export const ORGANIZATION_ID = `${getSiteUrl()}/#organization`;
export const WEBSITE_ID = `${getSiteUrl()}/#website`;

export function merchantReturnPolicyJsonLd() {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": `${getSiteUrl()}/returns#policy`,
    name: "Return and refund policy",
    url: absoluteUrl("/returns"),
    applicableCountry: "PK",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    refundType: "https://schema.org/FullRefund",
    merchantReturnLink: absoluteUrl("/returns"),
    returnPolicyCountry: {
      "@type": "Country",
      name: "Pakistan",
    },
  };
}

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
          "Moon Steel Fabricators is a stainless steel manufacturing facility in Karachi, Pakistan. The plant builds and supplies commercial kitchen equipment and custom stainless steel products for hotels, restaurants, QSRs, healthcare, pharmaceutical, and industrial facilities across Pakistan.",
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
          GOOGLE_MAPS_HREF,
        ],
        hasMap: GOOGLE_MAPS_HREF,
        hasMerchantReturnPolicy: merchantReturnPolicyJsonLd(),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteUrl,
        name: "Moon Steel Fabricators",
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/privacy`,
        url: `${siteUrl}/privacy`,
        name: "Privacy Policy",
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/returns`,
        url: `${siteUrl}/returns`,
        name: "Return and refund policy",
        isPartOf: { "@id": WEBSITE_ID },
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

export function catalogProductJsonLd(product: {
  name: string;
  details: string;
  path: string;
  slug: string;
  images: string[];
  categoryNames: string[];
  price?: number | null;
  currency?: string | null;
  sku?: string | null;
  availability?: string | null;
}) {
  const url = absoluteUrl(product.path);
  const availability =
    product.availability === "out_of_stock"
      ? "https://schema.org/OutOfStock"
      : product.availability === "preorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.details,
    image: product.images.length > 0 ? product.images : undefined,
    url,
    sku: product.sku || product.slug,
    category: product.categoryNames.join(", ") || undefined,
    brand: {
      "@type": "Brand",
      name: "Moon Steel Fabricators",
    },
    manufacturer: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Moon Steel Fabricators",
      url: getSiteUrl(),
    },
    offers: {
      "@type": "Offer",
      url: `${url}#buy`,
      priceCurrency: product.currency || "PKR",
      ...(typeof product.price === "number" && product.price > 0 ? { price: product.price.toFixed(2) } : {}),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      checkoutPageURLTemplate: `${url}#buy`,
      hasMerchantReturnPolicy: merchantReturnPolicyJsonLd(),
      seller: {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Moon Steel Fabricators",
      },
      areaServed: {
        "@type": "Country",
        name: "Pakistan",
      },
    },
  };
}
