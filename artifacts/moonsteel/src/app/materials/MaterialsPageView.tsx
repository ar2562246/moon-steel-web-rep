"use client";

import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DecisionTree,
  GradeSelector,
  MaterialCalculator,
  MaterialWizard,
} from "@/app/materials/MaterialsTools";
import {
  chemistry,
  comparisonMatrix,
  corrosionMatrix,
  faqs,
  finishes,
  gradeCards,
  quickGrades,
  quickSpecs,
  thicknessGuide,
  verifyMethods,
  whyMoonSteel,
} from "@/app/materials/materials-data";
import { cn } from "@/lib/utils";

function Stars({ count, max = 6 }: { count: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < count ? "fill-primary text-primary" : "text-border",
          )}
        />
      ))}
    </span>
  );
}

function FinishSwatch({ visual }: { visual: string }) {
  if (visual === "brushed") {
    return (
      <div
        className="h-28 w-full rounded-lg border border-border"
        style={{
          background:
            "repeating-linear-gradient(90deg, #d7dbe0 0px, #d7dbe0 1px, #eceff2 1px, #eceff2 4px)",
        }}
      />
    );
  }
  if (visual === "mirror") {
    return (
      <div className="h-28 w-full rounded-lg border border-border bg-gradient-to-br from-slate-100 via-white to-slate-300" />
    );
  }
  if (visual === "hairline") {
    return (
      <div
        className="h-28 w-full rounded-lg border border-border"
        style={{
          background:
            "repeating-linear-gradient(0deg, #cfd4da 0px, #cfd4da 1px, #e8ebef 1px, #e8ebef 3px)",
        }}
      />
    );
  }
  return <div className="h-28 w-full rounded-lg border border-border bg-slate-200" />;
}

function InlineCta({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-6">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StatusCell({ value }: { value: string }) {
  const tone =
    value === "Yes" || value === "Excellent"
      ? "text-primary"
      : value === "No" || value === "Caution"
        ? "text-muted-foreground"
        : "text-foreground";
  return <span className={cn("font-medium", tone)}>{value}</span>;
}

export function MaterialsPageView() {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero */}
        <section className="mb-12">
          <div className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
            <p className="apple-eyebrow mb-3">Stainless Steel Material Guide</p>
            <h1 className="apple-section-title mb-4 max-w-3xl section-title-accent">
              Choosing the Right Grade for Commercial Kitchens
            </h1>
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Moon Steel fabricates standard equipment in certified AISI 304, with 316 and other
              grades available for specialized environments. Use this guide to decide fast — then
              dive into engineering detail when you need it.
            </p>
            <ul className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
              {["Food Safe", "Corrosion Resistant", "Mill Certified", "Custom Thicknesses"].map(
                (item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="#compare-grades"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Compare Grades
              </a>
              <Link
                href="/#contact"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </section>

        {/* Quick grade cards */}
        <section className="mb-16">
          <SectionReveal className="grid gap-4 md:grid-cols-3">
            {quickGrades.map((item) => (
              <article
                key={item.grade}
                className={cn(
                  "layer-1 rounded-xl p-5",
                  item.highlight && "ring-1 ring-primary/25 border-primary/30",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-display font-semibold text-foreground">
                    {item.grade}
                    {item.highlight ? " ★" : ""}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {item.label}
                  </span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Best for</dt>
                    <dd className="font-medium text-foreground">{item.bestFor}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Corrosion</dt>
                    <dd>
                      <Stars count={item.corrosion} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Food safe</dt>
                    <dd className="font-medium text-foreground">{item.foodSafe}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </SectionReveal>
          <p className="mt-4 text-sm text-muted-foreground">
            Most visitors only need the overview above. Use the tools below for a tailored
            recommendation.
          </p>
        </section>

        <GradeSelector />

        {/* Grade comparison cards */}
        <section id="compare-grades" className="mb-16 scroll-mt-28">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Grade Comparison Cards
            </h2>
          </div>
          <SectionReveal className="grid gap-4 md:grid-cols-2">
            {gradeCards.map((card) => (
              <article key={card.grade} className="layer-1 rounded-2xl p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-display font-semibold text-foreground">
                      {card.grade}
                    </p>
                    <div className="mt-1">
                      <Stars count={card.rating} />
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {card.badge}
                  </span>
                </div>
                <ul className="mb-5 space-y-2">
                  {card.checks.map((check) => (
                    <li key={check} className="flex gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {check}
                    </li>
                  ))}
                </ul>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Typical uses
                </p>
                <p className="text-sm text-muted-foreground">{card.uses.join(" · ")}</p>
              </article>
            ))}
          </SectionReveal>
          <InlineCta href="/#contact" label="Request material recommendation" />
        </section>

        {/* Improved comparison matrix */}
        <section className="mb-16">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Property Comparison
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Scan by property — 304 is the commercial kitchen default; 316 is the premium upgrade.
            </p>
          </div>
          <div className="layer-1 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-semibold">Property</th>
                    {["201", "202", "304", "316", "430"].map((g) => (
                      <th key={g} className="px-4 py-3 font-semibold">
                        {g}
                        {g === "304" ? " ★" : ""}
                        {g === "316" ? " ★★" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.map((row) => (
                    <tr key={row.property} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{row.property}</td>
                      {(["201", "202", "304", "316", "430"] as const).map((g) => (
                        <td
                          key={g}
                          className={cn(
                            "px-4 py-3 text-muted-foreground",
                            g === "304" && "bg-primary/5 font-medium text-foreground",
                          )}
                        >
                          {row.values[g]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <InlineCta href="#grade-selector" label="Compare grades with the selector" />
        </section>

        <MaterialWizard />

        {/* Thickness */}
        <section id="thickness" className="mb-16 scroll-mt-28">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Recommended Thickness
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Grade and thickness both belong on the quote.
            </p>
          </div>
          <SectionReveal className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {thicknessGuide.map((item) => (
              <article key={item.mm} className="layer-1 rounded-xl p-4 text-center">
                <p className="text-lg font-display font-semibold text-primary">{item.mm}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.use}</p>
              </article>
            ))}
          </SectionReveal>
          <InlineCta href="/#contact" label="Get a custom fabrication quote" />
        </section>

        {/* Finishes */}
        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Surface Finish Gallery
            </h2>
          </div>
          <SectionReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {finishes.map((finish) => (
              <article key={finish.name} className="layer-1 overflow-hidden rounded-xl">
                <FinishSwatch visual={finish.visual} />
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground">{finish.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{finish.use}</p>
                </div>
              </article>
            ))}
          </SectionReveal>
        </section>

        {/* Chemistry */}
        <section className="mb-16">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Chemical Composition
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Approximate ranges engineers look for when comparing grades — and what an XRF gun or
              lab report should roughly match.
            </p>
          </div>
          <div className="layer-1 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-semibold">Grade</th>
                    <th className="px-4 py-3 font-semibold">Chromium</th>
                    <th className="px-4 py-3 font-semibold">Nickel</th>
                    <th className="px-4 py-3 font-semibold">Molybdenum</th>
                  </tr>
                </thead>
                <tbody>
                  {chemistry.map((row) => (
                    <tr key={row.grade} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3 font-semibold text-foreground">{row.grade}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.chromium}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.nickel}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.molybdenum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to verify actual grade */}
        <section id="verify-grade" className="mb-16 scroll-mt-28">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              How to Verify the Actual Grade
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Looking at shine is not enough. To know the real stainless grade, use paperwork plus
              chemistry checks — a material testing gun on site, or lab analysis for critical work.
            </p>
          </div>
          <SectionReveal className="grid gap-4 sm:grid-cols-2">
            {verifyMethods.map((method) => (
              <article key={method.title} className="layer-1 rounded-xl p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {method.level}
                </p>
                <h3 className="mt-2 text-lg font-display font-semibold text-foreground">
                  {method.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{method.body}</p>
              </article>
            ))}
          </SectionReveal>
          <div className="layer-2 mt-4 rounded-xl p-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Practical tip:</span> For 304, expect
              roughly 18% chromium and 8%+ nickel. For 316, also look for molybdenum (~2–3%). Low
              nickel with manganese-heavy readings often points to cheaper 200-series material —
              not commercial kitchen grade.
            </p>
          </div>
          <InlineCta href="/#contact" label="Ask about mill certificates for your order" />
        </section>

        {/* Corrosion matrix */}
        <section className="mb-16">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Can This Grade Survive?
            </h2>
          </div>
          <div className="layer-1 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[24rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-semibold">Environment</th>
                    <th className="px-4 py-3 font-semibold">304</th>
                    <th className="px-4 py-3 font-semibold">316</th>
                  </tr>
                </thead>
                <tbody>
                  {corrosionMatrix.map((row) => (
                    <tr key={row.env} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{row.env}</td>
                      <td className="px-4 py-3">
                        <StatusCell value={row["304"]} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusCell value={row["316"]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <MaterialCalculator />
        <DecisionTree />

        {/* Spec reference */}
        <section className="mb-16">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Engineering Spec Snapshot
            </h2>
          </div>
          <div className="layer-1 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <tbody>
                  {quickSpecs.map(([spec, value]) => (
                    <tr key={spec} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3 font-medium text-foreground">{spec}</td>
                      <td className="px-5 py-3 text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Moon Steel */}
        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Why Moon Steel
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Certified AISI 304 as standard — with 316 and other grades when your environment
              demands them. Every quote names grade, thickness, and finish.
            </p>
          </div>
          <SectionReveal className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {whyMoonSteel.map((item) => (
              <article
                key={item}
                className="layer-1 flex items-start gap-2 rounded-xl p-4 text-sm text-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </article>
            ))}
          </SectionReveal>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-5 text-2xl font-display font-semibold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="layer-1 rounded-2xl px-5 md:px-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <InlineCta href="/#contact" label="Speak with a stainless steel specialist" />
        </section>

        {/* Final CTA */}
        <section className="layer-1 rounded-2xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-display font-semibold text-foreground md:text-3xl">
            Ready to Specify Your Project?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground">
            Send drawings or environment notes and we will come back with grade, thickness, finish,
            and a fabrication quote.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Request a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Browse Products
            </Link>
            <a
              href="#material-wizard"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Use Grade Wizard
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
