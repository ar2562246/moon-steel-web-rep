"use client";

import { ChevronRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import type { ProductCategory } from "@/features/admin/types";

type ProductsProps = {
  initialCategories: ProductCategory[];
};

export function Products({ initialCategories }: ProductsProps) {
  return (
    <section id="products" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">Engineered Products.</h2>
          <p className="apple-section-copy max-w-2xl">
            We don't build generic equipment. Every item is fabricated to exact specifications,
            ensuring hygiene, durability, and operational flow.
          </p>
        </div>

        <SectionReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialCategories.map((product) => (
            <div
              key={product.id}
              className="group layer-1 p-6 rounded-xl hover:border-primary/40 transition-colors"
            >
              <div className="mb-6 pb-6 border-b border-border">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <div className="inline-block rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-mono text-primary">
                  {product.specs}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-foreground">{product.uses}</span>
                <ChevronRight className="w-5 h-5 text-primary opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 -translate-x-2 transition-[opacity,transform] duration-300" />
              </div>
            </div>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
