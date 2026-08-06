"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function MaterialCta() {
  return (
    <section className="layer-1 border-y border-border py-16">
      <div className="container mx-auto px-4 md:px-6">
        <SectionReveal className="mx-auto flex max-w-3xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Why SS 304 matters
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              Commercial kitchens need certified 300-series stainless — not cheap 200-series substitutes
              that rust and fail hygiene audits.
            </p>
          </div>
          <Link
            href="/materials"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read material guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}
