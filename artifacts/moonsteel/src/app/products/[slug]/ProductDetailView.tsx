"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ImageGallery } from "@/components/media/ImageGallery";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { getCatalogCategoryFilterPath, getCatalogProductImages } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";
import { catalogItem, trackViewItem } from "@/lib/analytics/gtag";

type ProductDetailViewProps = {
  product: CatalogProduct;
};

function CategoryPills({ product }: { product: CatalogProduct }) {
  if (product.categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {product.categories.map((category) => (
        <Link
          key={category.id}
          href={getCatalogCategoryFilterPath(category.slug)}
          className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

function QuoteButton({ className }: { className?: string }) {
  return (
    <Link
      href="/contact"
      className={
        className ??
        "inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      }
    >
      Request a quote
    </Link>
  );
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const images = getCatalogProductImages(product);
  const isGreaseTrap = product.categories.some((category) => category.slug === "grease-traps");

  useEffect(() => {
    trackViewItem(catalogItem(product));
  }, [product.slug]);

  return (
    <main className="pt-20 pb-28 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink
          href={isGreaseTrap ? "/grease-traps" : "/products"}
          label={isGreaseTrap ? "grease traps" : "catalog"}
          className="mb-3 md:mb-8"
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start lg:gap-10 md:gap-6">
          <div className="space-y-5 md:space-y-6">
            <ImageGallery images={images} title={product.name} />

            <div className="space-y-3 lg:hidden">
              <CategoryPills product={product} />
              <h1 className="text-2xl font-display font-semibold leading-snug text-foreground">
                {product.name}
              </h1>
              <QuoteButton />
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-foreground md:text-xl">Product Details</h2>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {product.details}
              </p>
            </div>
          </div>

          <aside className="hidden space-y-6 rounded-2xl border border-border p-6 lg:block layer-1">
            <CategoryPills product={product} />

            <div className="space-y-2">
              <h1 className="text-3xl font-display font-semibold text-foreground">{product.name}</h1>
            </div>

            {images.length > 1 ? (
              <p className="text-sm text-muted-foreground">{images.length} product photos</p>
            ) : null}

            <QuoteButton />
          </aside>
        </div>
      </div>
    </main>
  );
}
