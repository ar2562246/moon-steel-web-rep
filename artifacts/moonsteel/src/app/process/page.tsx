import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProcessPageView } from "@/app/process/ProcessPageView";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { PROCESS_INTRO } from "@/lib/process/steps";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "From Concept to Kitchen — Fabrication Process",
  description:
    "How Moon Steel Fabricators takes commercial kitchen equipment from consultation and AutoCAD drawings to Karachi fabrication and on-site installation.",
  keywords: [
    "stainless steel fabrication process",
    "commercial kitchen fabrication Karachi",
    "AutoCAD kitchen drawings",
    "stainless steel installation Pakistan",
  ],
  alternates: {
    canonical: "/process",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/process"),
    title: "From Concept to Kitchen | Moon Steel Fabricators",
    description: PROCESS_INTRO,
  },
};

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Process", path: "/process" },
        ])}
      />
      <ProcessPageView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
