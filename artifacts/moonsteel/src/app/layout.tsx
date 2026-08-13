import type { Metadata } from "next";
import "../index.css";
import { Header } from "@/components/layout/Header";
import { VercelInsights } from "@/components/VercelInsights";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { organizationGraph } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Commercial Kitchen Equipment Manufacturer in Pakistan | Moon Steel Fabricators",
    template: "%s | Moon Steel Fabricators",
  },
  description:
    "Moon Steel Fabricators fabricates AISI 304 and AISI 316 commercial kitchen equipment and custom stainless steel work for hotels, restaurants, QSRs, hospitals, and industrial facilities in Pakistan.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Commercial Kitchen Equipment Manufacturer in Pakistan | Moon Steel Fabricators",
    description:
      "AISI 304 and AISI 316 stainless steel fabrication for commercial kitchens — from drawings to fabrication and installation in Karachi.",
    siteName: "Moon Steel Fabricators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Kitchen Equipment Manufacturer in Pakistan | Moon Steel Fabricators",
    description:
      "AISI 304 and AISI 316 stainless steel fabrication for hotels, restaurants, QSRs, hospitals, and industrial facilities.",
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
        <JsonLd data={organizationGraph()} />
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
