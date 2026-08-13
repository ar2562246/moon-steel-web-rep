import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FoodFusionCollabView } from "@/app/collaboration/food-fusion/FoodFusionCollabView";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Moon Steel × Food Fusion",
  description:
    "Moon Steel Fabricators fabricates laser-cut stainless steel kitchen tools for Food Fusion — trivets, BBQ grills, skewers, spatulas, and kulfi mould stands, made in Karachi.",
  alternates: {
    canonical: "/collaboration/food-fusion",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/collaboration/food-fusion"),
    title: "Moon Steel × Food Fusion | Moon Steel Fabricators",
    description:
      "Food Fusion designs it. We fabricate it in Karachi — laser-cut stainless steel kitchen tools for Pakistan's largest food brand.",
  },
};

export default function FoodFusionCollabPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Food Fusion", path: "/collaboration/food-fusion" },
        ])}
      />
      <FoodFusionCollabView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
