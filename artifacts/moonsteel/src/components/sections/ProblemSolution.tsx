"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function ProblemSolution() {
  return (
    <section className="py-24 bg-muted text-foreground relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="apple-section-title mb-6">
            The Market is Full of Shortcuts.
          </h2>
          <p className="apple-section-copy">
            Most local competitors quietly substitute cheaper materials to win on price. The result? Equipment that warps, rusts, and fails health inspections within a few years.
          </p>
        </div>

        <SectionReveal className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <div className="apple-surface p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <XCircle className="w-8 h-8 text-destructive" />
              <h3 className="text-2xl font-display font-semibold text-foreground">The Typical Workshop</h3>
            </div>
            <ul className="space-y-5">
              {[
                "Uses SS 200 series (cheaper, magnetic, rusts quickly)",
                "Reduces gauge thickness to save costs (causes warping)",
                "Spot or MIG welding that breaks under stress",
                "Mill finish with sharp, hazardous edges",
                "Fails international HACCP hygiene standards"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-primary-callout p-8 rounded-xl shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-primary/20 relative z-10">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-display font-semibold text-foreground">Moon Steel Standard</h3>
            </div>
            <ul className="space-y-5 relative z-10">
              {[
                "100% Certified SS 304 (high nickel, non-magnetic, corrosion resistant)",
                "Accurate, heavy-duty gauge thickness specified for load",
                "Precision Laser Welding, ground flat and polished",
                "Food-grade #4 satin finish with radiused, deburred edges",
                "Fully HACCP-compliant for strict health inspections"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
