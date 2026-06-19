"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { getCatalogCategoryFilterPath, getCatalogProductCover, getCatalogProductPath } from "@/features/catalog/paths";
import type { CatalogCategorySummary, CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type ProductCatalogViewProps = {
  products: CatalogProduct[];
  categories: CatalogCategorySummary[];
  activeCategory?: string;
};

export function ProductCatalogView({ products, categories, activeCategory }: ProductCatalogViewProps) {
  return (
    <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 max-w-3xl">
            <h1 className="apple-section-title mb-4 section-title-accent">Product Catalog</h1>
            <p className="apple-section-copy">
              Browse commercial stainless steel equipment by category. Each product has a dedicated page with
              specifications and installation details.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="mb-10 flex flex-wrap gap-2">
              <Link
                href="/products"
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  !activeCategory
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={getCatalogCategoryFilterPath(category.slug)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    activeCategory === category.slug
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {products.length === 0 ? (
            <p className="text-muted-foreground">No products found in this category.</p>
          ) : (
            <SectionReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={getCatalogProductPath(product.slug)}
                  className="group layer-1 overflow-hidden rounded-xl transition-colors hover:border-primary/40"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getCatalogProductCover(product)}
                      alt={product.name}
                      className="h-full w-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-3 p-6">
                    <div className="flex flex-wrap gap-1.5">
                      {product.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h2>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{product.details}</p>
                    <div className="flex items-center justify-between pt-2 text-sm text-primary">
                      <span>View product</span>
                      <ChevronRight className="h-4 w-4 opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 -translate-x-2 transition-[opacity,transform]" />
                    </div>
                  </div>
                </Link>
              ))}
            </SectionReveal>
          )}
        </div>
      </main>
  );
}
