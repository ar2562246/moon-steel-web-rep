"use client";

import Link from "next/link";
import { ArrowRight, Check, Hammer, MessageSquare, PenTool, Truck } from "lucide-react";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { PROCESS_INTRO, PROCESS_STEPS } from "@/lib/process/steps";

const icons = {
  consultation: MessageSquare,
  design: PenTool,
  fabrication: Hammer,
  installation: Truck,
} as const;

export function ProcessPageView() {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <section className="mb-16">
          <div className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
            <p className="apple-eyebrow mb-3">How we work</p>
            <h1 className="apple-section-title mb-4 max-w-3xl section-title-accent">
              From Concept to Kitchen.
            </h1>
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {PROCESS_INTRO} Four stages — consultation, drawing approval, Karachi fabrication, and
              on-site installation — so commercial kitchen equipment lands to spec.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a project
              </Link>
              <a
                href="#consultation"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                See the four stages
              </a>
            </div>
          </div>
        </section>

        <SectionReveal className="mb-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = icons[step.id];
            return (
              <a
                key={step.id}
                href={`#${step.id}`}
                className="layer-1 rounded-xl p-5 transition-colors hover:border-primary/40"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <Icon className="mt-3 h-6 w-6 text-foreground" />
                <p className="mt-3 text-lg font-display font-semibold text-foreground">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>
              </a>
            );
          })}
        </SectionReveal>

        <div className="space-y-12">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = icons[step.id];
            return (
              <section key={step.id} id={step.id} className="scroll-mt-28">
                <article className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                      <Icon className="h-7 w-7 text-foreground" />
                      <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Stage {index + 1}
                      </p>
                      <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
                        {step.title}
                      </h2>
                    </div>
                  </div>
                  <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{step.body}</p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            );
          })}
        </div>

        <section className="mt-16">
          <div className="layer-2 rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Ready to start?
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Send drawings, photos, or a short brief. We will come back with a fabrication scope
              and next steps.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Request a quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
