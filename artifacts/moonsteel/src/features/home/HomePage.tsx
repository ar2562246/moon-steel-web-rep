"use client";

import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBand } from "@/components/sections/TrustBand";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { Products } from "@/components/sections/Products";
import { Comparison } from "@/components/sections/Comparison";
import { MaterialCta } from "@/components/sections/MaterialCta";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { FoodFusionCollab } from "@/components/sections/FoodFusionCollab";
import { Testimonials } from "@/components/sections/Testimonials";
import { Industries } from "@/components/sections/Industries";
import { ContactForm } from "@/components/sections/ContactForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { HomePageData } from "@/features/home/queries";

type HomePageProps = {
  data: HomePageData;
};

export default function HomePage({ data }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero initialHeroImages={data.heroImages} />
        <TrustBand
          initialLogos={data.customerLogos}
          initialSliderSpeed={data.logoSliderSpeed}
        />
        <ProblemSolution />
        <Products initialCategories={data.productCategories} />
        <Comparison />
        <MaterialCta />
        <Process />
        <Projects initialProjects={data.projects} />
        <FoodFusionCollab />
        <Testimonials initialTestimonials={data.testimonials} />
        <Industries />
        <ContactForm />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
