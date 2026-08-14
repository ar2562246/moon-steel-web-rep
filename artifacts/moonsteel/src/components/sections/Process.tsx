"use client";

import Link from "next/link";
import { ArrowRight, Hammer, MessageSquare, PenTool, Truck } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { PROCESS_INTRO, PROCESS_STEPS } from "@/lib/process/steps";

const icons = {
  consultation: MessageSquare,
  design: PenTool,
  fabrication: Hammer,
  installation: Truck,
} as const;

export function Process() {
  return (
    <section id="process" className="layer-0 py-24 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="apple-section-title mb-6">
            <Link href="/process" className="transition-colors hover:text-primary">
              From Concept to Kitchen.
            </Link>
          </h2>
          <p className="apple-section-copy">{PROCESS_INTRO}</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <SectionReveal className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = icons[step.id];
              return (
                <Link
                  key={step.id}
                  href={`/process#${step.id}`}
                  className="flex flex-col items-center text-center group overflow-visible pt-2 md:pt-0"
                >
                  <div className="layer-1 relative mb-6 flex h-20 w-20 shrink-0 items-center justify-center overflow-visible rounded-full shadow-sm transition-colors duration-300 md:group-hover:border-primary md:group-hover:bg-primary/5">
                    <Icon className="h-7 w-7 text-foreground transition-colors md:group-hover:text-primary md:h-8 md:w-8" />
                    <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shadow-sm md:-right-2 md:-top-2 md:h-8 md:w-8 md:text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3 transition-colors group-hover:text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.summary}</p>
                </Link>
              );
            })}
          </SectionReveal>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/process"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Read the full process
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
