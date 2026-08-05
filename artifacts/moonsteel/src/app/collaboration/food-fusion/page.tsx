import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FoodFusionCollabView } from "@/app/collaboration/food-fusion/FoodFusionCollabView";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moonsteelfab.com";

export const metadata: Metadata = {
  title: "Moon Steel × Food Fusion",
  description:
    "Moon Steel Fabricators fabricates laser-cut stainless steel kitchen tools for Food Fusion — trivets, BBQ grills, skewers, spatulas, and kulfi mould stands, made in Karachi.",
  alternates: {
    canonical: "/collaboration/food-fusion",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/collaboration/food-fusion`,
    title: "Moon Steel × Food Fusion | Moon Steel",
    description:
      "Food Fusion designs it. We fabricate it in Karachi — laser-cut stainless steel kitchen tools for Pakistan's largest food brand.",
  },
};

export default function FoodFusionCollabPage() {
  return (
    <>
      <FoodFusionCollabView />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
