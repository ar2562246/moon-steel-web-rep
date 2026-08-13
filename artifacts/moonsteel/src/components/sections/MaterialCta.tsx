"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { cn } from "@/lib/utils";

const highlights = ["Mill-certified 304", "Food-contact safe", "316 for coastal sites"];

const grades = [
  {
    grade: "201 / 202",
    badge: "Avoid for food contact",
    summary: "Looks like stainless on day one. Nickel is swapped for manganese, so it rusts in wet kitchens and fails hygiene checks.",
    points: ["Lower nickel, higher manganese", "Pits around sinks, drains, and dishwashers", "Not used on Moon Steel food equipment"],
    featured: false,
  },
  {
    grade: "AISI 304",
    badge: "Moon Steel standard",
    summary: "18/8 chromium-nickel stainless. It stays food-safe through daily wash-down, acidic food, and commercial detergents.",
    points: ["18% chromium, 8% nickel", "Easy to clean, food-grade finish", "Mill certificates with every order"],
    featured: true,
  },
  {
    grade: "AISI 316",
    badge: "Harsh environments",
    summary: "Adds molybdenum for chlorides. Specify it for coastal kitchens, seafood, labs, and aggressive chemical cleaning.",
    points: ["Better salt and chlorine resistance", "Coastal, seafood, hospital, and lab sites", "Available on request"],
    featured: false,
  },
] as const;

export function MaterialCta() {
  return (
    <section id="materials" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-2xl md:mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">Why SS 304 matters.</h2>
          <p className="apple-section-copy">
            Commercial kitchens need certified 300-series stainless. 200-series sheets are cheaper
            because they cut nickel. They look the same at install, then rust and fail hygiene
            audits.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
            {highlights.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <SectionReveal className="grid gap-4 md:grid-cols-3">
          {grades.map((item) => (
            <article
              key={item.grade}
              className={cn(
                "flex flex-col rounded-2xl p-6",
                item.featured
                  ? "surface-primary-callout"
                  : "layer-1",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {item.badge}
              </p>
              <h3 className="mt-2 text-xl font-display font-semibold text-foreground">
                {item.grade}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground">
                {item.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </SectionReveal>

        <div className="mt-10 flex flex-wrap justify-end gap-3">
          <Button asChild>
            <Link href="/materials">
              Read material guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/materials#compare-grades">Compare grades</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
