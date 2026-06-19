"use client";

import { Check, X } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";

const comparisons = [
  {
    feature: "Steel Grade",
    moon: "Certified SS 304",
    others: "Uncertified SS 200 Series",
  },
  {
    feature: "Gauge Thickness",
    moon: "Spec-accurate (Heavy Duty)",
    others: "Reduced / Compromised",
  },
  {
    feature: "Welds",
    moon: "Precision Laser Welding, ground & polished",
    others: "Spot/MIG, unfinished",
  },
  {
    feature: "Finish",
    moon: "#4 Food-grade satin",
    others: "Mill finish",
  },
  {
    feature: "Edges",
    moon: "Radiused, deburred (Safe)",
    others: "Sharp, hazardous",
  },
  {
    feature: "Lifespan",
    moon: "10–15+ years",
    others: "2–4 years",
  },
];

export function Comparison() {
  return (
    <section id="comparison" className="layer-0 py-24 text-foreground">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="apple-section-title mb-6">
            The Moon Steel Difference.
          </h2>
          <p className="apple-section-copy">
            A clear side-by-side specification view so you can see exactly what
            you get.
          </p>
        </div>

        <SectionReveal className="max-w-5xl mx-auto">
          <div className="layer-1 overflow-hidden rounded-xl border border-border/80 ring-1 ring-black/5">
            <div className="layer-2 hidden md:grid md:grid-cols-12 border-b border-border/80">
              <div className="col-span-4 p-5">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Specification
                </span>
              </div>
              <div className="col-span-4 p-5 border-l border-border/70 bg-primary/5">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-primary">
                  Moon Steel Standard
                </span>
              </div>
              <div className="col-span-4 p-5 border-l border-border/70">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Typical Workshop
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {comparisons.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-1 md:grid-cols-12 border-t first:border-t-0 border-border/70 ${
                    i % 2 === 0 ? "bg-layer-1" : "bg-layer-3"
                  }`}
                >
                  <div className="md:col-span-4 p-5">
                    <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-1 md:hidden">
                      Specification
                    </p>
                    <p className="font-semibold text-foreground">{row.feature}</p>
                  </div>

                  <div className="layer-2 layer-tint-primary md:col-span-4 p-5 border-t md:border-t-0 md:border-l border-border/70">
                    <p className="text-xs uppercase tracking-[0.06em] text-primary mb-2 md:hidden">
                      Moon Steel Standard
                    </p>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{row.moon}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 p-5 border-t md:border-t-0 md:border-l border-border/70">
                    <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2 md:hidden">
                      Typical Workshop
                    </p>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-destructive/85">{row.others}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
