"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCatalogProductPath } from "@/features/catalog/paths";
import { ProductCardImage } from "@/app/products/ProductCardImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { GreaseTrapCalculator } from "@/app/grease-traps/GreaseTrapCalculator";
import {
  cleaningSteps,
  constructionLabels,
  faqs,
  features,
  greaseTrapProducts,
  howItWorks,
  installPoints,
  specRows,
} from "@/app/grease-traps/grease-traps-data";

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

function FlowSchematic() {
  return (
    <div className="layer-2 overflow-hidden rounded-xl p-5 text-center md:p-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Commercial kitchen
      </p>
      <p className="mt-1 text-sm text-foreground">Grease-laden wastewater</p>
      <p className="my-2 text-muted-foreground" aria-hidden>
        ↓
      </p>
      <div className="mx-auto max-w-md rounded-lg border border-border bg-background/80 px-4 py-5">
        <p className="text-sm font-medium text-foreground">Grease trap</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <p>Grease rises ↑</p>
          <p>Flow slows</p>
          <p>Solids settle ↓</p>
        </div>
      </div>
      <p className="my-2 text-muted-foreground" aria-hidden>
        ↓
      </p>
      <p className="text-sm text-foreground">Treated flow</p>
    </div>
  );
}

type CatalogImage = Pick<CatalogProduct, "name" | "image_url" | "image_urls">;

type GreaseTrapPageViewProps = {
  catalogImages?: Record<string, CatalogImage>;
};

export function GreaseTrapPageView({ catalogImages = {} }: GreaseTrapPageViewProps) {
  return (
    <main className="layer-0 pb-20 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <section className="mb-12">
          <div className="layer-1 overflow-hidden rounded-2xl p-6 md:p-10">
            <p className="apple-eyebrow mb-3">Commercial Kitchen Drainage</p>
            <h1 className="apple-section-title mb-4 max-w-3xl section-title-accent">
              Commercial Stainless Steel Grease Traps
            </h1>
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Heavy-duty AISI 304 stainless steel grease traps designed to separate fats, oils, and
              grease from commercial kitchen wastewater. Fabricated in Karachi for restaurants,
              hotels, and institutional kitchens across Pakistan.
            </p>
            <ul className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
              {["AISI 304", "1.50 mm body", "TIG welded", "Custom sizes"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="#calculator"
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Calculate Your Required Size
              </a>
              <Link
                href="/#contact"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                Request a Quote
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {greaseTrapProducts.map((product) => (
                <a
                  key={product.id}
                  href={`#${product.id}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {product.positioning}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              What a Grease Trap Does
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A grease trap slows wastewater and provides separation time for fats, oils, and grease
              (FOG) to float while heavier solids settle before wastewater leaves the unit.
            </p>
          </div>
          <FlowSchematic />
        </section>

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              How Our Grease Traps Work
            </h2>
          </div>
          <SectionReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <article key={item.step} className="layer-1 rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {item.step}
                </p>
                <h3 className="mt-2 text-lg font-display font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section id="features" className="mb-16 scroll-mt-28">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Features
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Built as fabricated stainless steel interceptors, not generic drainage boxes.
            </p>
          </div>
          <SectionReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <article key={item.title} className="layer-1 rounded-xl p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Internal Construction
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inlet → inlet chamber → baffle → main separation chamber → outlet baffle → outlet. The
              aim is to prevent incoming wastewater from taking a straight path to the outlet.
            </p>
          </div>
          <SectionReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {constructionLabels.map((item) => (
              <article key={item.n} className="layer-1 rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {item.n}. {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section id="range" className="mb-16 scroll-mt-28">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Our Grease Trap Range
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Each model lists nominal GPM, overall size, and inlet/outlet. Gross tank volume is the
              geometric capacity of the tank.
            </p>
          </div>
          <SectionReveal className="grid gap-4 md:grid-cols-3">
            {greaseTrapProducts.map((product) => (
              <article
                key={product.id}
                id={product.id}
                className="layer-1 flex flex-col overflow-hidden rounded-2xl scroll-mt-28"
              >
                <Link href={getCatalogProductPath(product.slug)} className="block">
                    <ProductCardImage
                    product={
                      catalogImages[product.slug] ?? {
                        name: product.name,
                        image_url: "",
                      }
                    }
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {product.code}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {product.positioning}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.size}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Flow</dt>
                    <dd className="font-medium text-foreground">{product.gpm} GPM</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Gross volume</dt>
                    <dd className="font-medium text-foreground">
                      ~{product.grossGal} gal / {product.grossLitres} L
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Material</dt>
                    <dd className="font-medium text-foreground">{product.material}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Inlet</dt>
                    <dd className="font-medium text-foreground">{product.inlet}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Outlet</dt>
                    <dd className="font-medium text-foreground">{product.outlet}</dd>
                  </div>
                  {product.internals ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Internals</dt>
                      <dd className="text-right font-medium text-foreground">{product.internals}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-4 text-sm text-muted-foreground">{product.application}.</p>
                <Link
                  href={getCatalogProductPath(product.slug)}
                  className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-primary hover:underline"
                >
                  View technical details
                  <ArrowRight className="h-4 w-4" />
                </Link>
                </div>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Which Grease Trap Is Right for Me?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These descriptions are Moon Steel product positioning, not a code certification.
            </p>
          </div>
          <SectionReveal className="grid gap-4 md:grid-cols-3">
            {greaseTrapProducts.map((product) => (
              <article key={product.id} className="layer-1 rounded-xl p-5">
                <h3 className="text-lg font-display font-semibold text-foreground">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.size} · Inlet {product.inlet} · Outlet {product.outlet}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {product.uses.map((use) => (
                    <li key={use} className="flex gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {use}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </SectionReveal>
        </section>

        <GreaseTrapCalculator />

        <section className="mb-16">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Material Specification
            </h2>
          </div>
          <div className="layer-1 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <tbody>
                  {specRows.map(([spec, value]) => (
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

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Proper Installation Matters
            </h2>
          </div>
          <SectionReveal className="grid gap-3 sm:grid-cols-2">
            {installPoints.map((point) => (
              <article
                key={point}
                className="layer-1 flex items-start gap-2 rounded-xl p-4 text-sm text-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section className="mb-16">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Cleaning & Maintenance
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Do not allow grease and solids to accumulate until they significantly reduce the
              effective working volume.
            </p>
          </div>
          <ol className="layer-1 space-y-0 divide-y divide-border/70 overflow-hidden rounded-2xl">
            {cleaningSteps.map((step, index) => (
              <li key={step} className="flex gap-3 px-5 py-3 text-sm text-foreground">
                <span className="font-medium text-primary">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-16">
          <div className="layer-1 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Need a Different Size?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              We manufacture custom stainless steel grease traps to suit kitchen layout, drainage
              requirements, and project specifications — including inlet and outlet size, cover
              arrangement, and overall dimensions.
            </p>
            <InlineCta href="/#contact" label="Request a custom size" />
          </div>
        </section>

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
          <InlineCta href="/#contact" label="Speak with a fabrication specialist" />
        </section>

        <section className="mb-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-display font-semibold text-foreground md:text-3xl">
              Commercial Grease Trap Manufacturer in Pakistan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Moon Steel fabricates stainless steel grease traps and grease interceptors in Karachi
              for restaurant kitchens, hotels, and food-service drainage. Standard Small, Medium, and
              Large sizes are listed above; custom grease trap sizing is quoted from drawings.
            </p>
          </div>
        </section>

        <section className="layer-1 rounded-2xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-display font-semibold text-foreground md:text-3xl">
            Not sure which grease trap you need?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground">
            Tell us about your kitchen and we will help determine the appropriate configuration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#calculator"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Calculate Required Size
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            >
              Request a Quote
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
