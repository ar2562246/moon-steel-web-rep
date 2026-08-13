"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function ProblemSolution() {
  return (
    <section className="py-24 bg-muted text-foreground relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="apple-section-title mb-6">
            What Separates Professional Fabrication From Commodity Work
          </h2>
          <p className="apple-section-copy">
            Commodity stainless work is often unspecified. Moon Steel fabricates to named grades, controlled thickness, and documented dimensions.
          </p>
        </div>

        <SectionReveal className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <div className="apple-surface p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <XCircle className="w-8 h-8 text-destructive" />
              <h3 className="text-2xl font-display font-semibold text-foreground">Commodity Fabrication</h3>
            </div>
            <ul className="space-y-5">
              {[
                "Material grade may not be specified",
                "Thickness selected primarily around price",
                "Basic MIG or spot welding",
                "Sharp or unfinished edges",
                "Limited dimensional documentation",
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
                "Specified AISI 304 or 316 stainless steel",
                "Controlled material thickness",
                "Precision cutting and controlled welding",
                "Ground, deburred and finished edges",
                "Designed for hygienic commercial food environments",
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
