"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ProductCardImage } from "@/app/products/ProductCardImage";
import { getCatalogCategoryFilterPath, getCatalogProductPath } from "@/features/catalog/paths";
import type { CatalogCategorySummary, CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { GreaseTrapCardSpecsList } from "@/app/grease-traps/GreaseTrapCardSpecs";

type ProductCatalogViewProps = {
  products: CatalogProduct[];
  categories: CatalogCategorySummary[];
  activeCategory?: string;
};

function categoryLinkClass(active: boolean) {
  return cn(
    "block rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );
}

function CategoryNav({
  categories,
  activeCategory,
  className,
}: {
  categories: CatalogCategorySummary[];
  activeCategory?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Product categories" className={className}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Categories
      </p>
      <ul className="space-y-0.5">
        <li>
          <Link href="/products" className={categoryLinkClass(!activeCategory)}>
            All products
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={getCatalogCategoryFilterPath(category.slug)}
              className={categoryLinkClass(activeCategory === category.slug)}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileCategoryChips({
  categories,
  activeCategory,
}: {
  categories: CatalogCategorySummary[];
  activeCategory?: string;
}) {
  return (
    <nav
      aria-label="Product categories"
      className="mb-8 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        href="/products"
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
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
            "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
            activeCategory === category.slug
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

export function ProductCatalogView({ products, categories, activeCategory }: ProductCatalogViewProps) {
  const activeName = categories.find((category) => category.slug === activeCategory)?.name;

  return (
    <main className="pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink
          href={activeCategory ? "/products" : "/"}
          label={activeCategory ? "all products" : "home"}
        />
        {categories.length > 0 ? (
          <MobileCategoryChips categories={categories} activeCategory={activeCategory} />
        ) : null}

        <div
          className={cn(
            "grid gap-8",
            categories.length > 0 ? "lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start" : null
          )}
        >
          {categories.length > 0 ? (
            <aside className="hidden lg:block lg:sticky lg:top-28">
              <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                <CategoryNav categories={categories} activeCategory={activeCategory} />
              </div>
            </aside>
          ) : null}

          <div>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h1 className="text-lg font-display font-semibold text-foreground">
                {activeName ?? "All products"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>

            {activeCategory === "grease-traps" ? (
              <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">Need help choosing a size?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a GPM rating to see the recommended Moon Steel size, inlet, and outlet.
                </p>
                <Link
                  href="/grease-traps#calculator"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open grease trap calculator
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            {products.length === 0 ? (
              <p className="text-muted-foreground">No products found in this category.</p>
            ) : (
              <SectionReveal className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={getCatalogProductPath(product.slug)}
                    className="group layer-1 overflow-hidden rounded-xl transition-colors hover:border-primary/40"
                  >
                    <ProductCardImage product={product} priority={index < 2} />
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
                      <h3 className="text-xl font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      {product.categories.some((category) => category.slug === "grease-traps") ? (
                        <GreaseTrapCardSpecsList product={product} />
                      ) : (
                        <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                          {product.details}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 text-sm text-primary">
                        <span>View product</span>
                        <ChevronRight className="h-4 w-4 -translate-x-2 opacity-0 transition-[opacity,transform] md:group-hover:translate-x-0 md:group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                ))}
              </SectionReveal>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
