import type { Metadata } from "next";
import "../index.css";
import { Header } from "@/components/layout/Header";
import { VercelInsights } from "@/components/VercelInsights";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";
const ogImage = "/ms3-logo.svg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moon Steel | Commercial Stainless Steel Fabrication",
    template: "%s | Moon Steel",
  },
  description:
    "Moon Steel provides commercial stainless steel fabrication for hotels, hospitals, restaurants, and industrial kitchens in Pakistan.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Moon Steel | Commercial Stainless Steel Fabrication",
    description:
      "Commercial kitchen-grade stainless steel fabrication: prep stations, sink units, exhaust systems, and custom industrial solutions.",
    siteName: "Moon Steel",
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "Moon Steel commercial stainless steel fabrication",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moon Steel | Commercial Stainless Steel Fabrication",
    description:
      "Commercial kitchen-grade stainless steel fabrication for hospitality, healthcare, and industrial environments.",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/ms3-logo.svg",
    shortcut: "/ms3-logo.svg",
    apple: "/ms3-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Moon Steel",
              url: siteUrl,
              logo: `${siteUrl}/ms3-logo.svg`,
              description:
                "Commercial stainless steel fabrication for kitchens, healthcare, and industrial food-service operations.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Plot 142, Sector 24, Korangi Industrial Area",
                addressLocality: "Karachi",
                addressCountry: "PK",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92-21-35121145-46",
                contactType: "sales",
              },
            }),
          }}
        />
        <AuthProvider>
          <div className="tesla-theme min-h-screen bg-background">
            <Header />
            {children}
          </div>
        </AuthProvider>
        <Toaster />
        <VercelInsights />
      </body>
    </html>
  );
}
