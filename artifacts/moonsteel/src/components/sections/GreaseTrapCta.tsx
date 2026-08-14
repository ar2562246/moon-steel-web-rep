"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ProductCardImage } from "@/app/products/ProductCardImage";
import { getCatalogProductPath } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";
import type { HomeGreaseTrapSection } from "@/features/home/queries";
import { GreaseTrapCardSpecsList } from "@/app/grease-traps/GreaseTrapCardSpecs";

type GreaseTrapCtaProps = {
  section: HomeGreaseTrapSection;
};

const highlights = ["AISI 304 stainless", "Size calculator", "Custom sizes"];

function sectionTitle(title: string) {
  const trimmed = title.trim().replace(/\.$/, "");
  return `${trimmed}.`;
}

export function GreaseTrapCta({ section }: GreaseTrapCtaProps) {
  const products = section.products;

  return (
    <section id="grease-traps" className="bg-muted py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-2xl md:mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">{sectionTitle(section.title)}</h2>
          <p className="apple-section-copy whitespace-pre-line">{section.description}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
            {highlights.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {products.length > 0 ? (
          <SectionReveal className="grid gap-4 md:grid-cols-3">
            {products.map((product, index) => (
              <GreaseTrapProductCard key={product.id} product={product} priority={index < 3} />
            ))}
          </SectionReveal>
        ) : null}

        <div className="mt-10 flex flex-wrap justify-end gap-3">
          <Link
            href="/grease-traps"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore grease traps
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/grease-traps#calculator"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Open size calculator
          </Link>
        </div>
      </div>
    </section>
  );
}

function GreaseTrapProductCard({
  product,
  priority,
}: {
  product: CatalogProduct;
  priority: boolean;
}) {
  return (
    <Link
      href={getCatalogProductPath(product.slug)}
      className="layer-1 group flex flex-col overflow-hidden rounded-2xl transition-colors hover:border-primary/40"
    >
      <ProductCardImage product={product} priority={priority} />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-display font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <GreaseTrapCardSpecsList product={product} />
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          View product
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
