"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ProductCardImage } from "@/app/products/ProductCardImage";
import {
  greaseTrapProducts,
  type GreaseTrapCatalogImage,
} from "@/app/grease-traps/grease-traps-data";
import { getCatalogProductPath } from "@/features/catalog/paths";

type GreaseTrapCtaProps = {
  catalogImages?: Record<string, GreaseTrapCatalogImage>;
};

const highlights = ["AISI 304 stainless", "Three standard sizes", "Size calculator"];

export function GreaseTrapCta({ catalogImages = {} }: GreaseTrapCtaProps) {
  return (
    <section id="grease-traps" className="bg-muted py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-2xl md:mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">Grease Traps.</h2>
          <p className="apple-section-copy">
            AISI 304 stainless steel grease traps for commercial kitchens — Small 17 GPM, Medium
            34 GPM, and Large 120 GPM. Compare sizes, then use the calculator to estimate flow.
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
          {greaseTrapProducts.map((product) => {
            const catalogImage = catalogImages[product.slug] ?? {
              name: product.name,
              image_url: "",
            };

            return (
              <Link
                key={product.id}
                href={getCatalogProductPath(product.slug)}
                className="layer-1 group flex flex-col overflow-hidden rounded-2xl transition-colors hover:border-primary/40"
              >
                <ProductCardImage product={catalogImage} />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {product.gpm} GPM
                    </p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {product.positioning}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.size}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Inlet {product.inlet} · Outlet {product.outlet}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View product
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </SectionReveal>

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
