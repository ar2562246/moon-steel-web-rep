"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImageGallery } from "@/components/media/ImageGallery";
import { getCatalogCategoryFilterPath, getCatalogProductImages } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";

type ProductDetailViewProps = {
  product: CatalogProduct;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const images = getCatalogProductImages(product);

  return (
    <main className="pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-6">
            <ImageGallery images={images} title={product.name} />

            <div className="space-y-3">
              <h2 className="text-xl font-display font-semibold text-foreground">Product Details</h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                {product.details}
              </p>
            </div>
          </div>

          <aside className="layer-1 space-y-6 rounded-2xl border border-border p-6">
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

            <div className="space-y-2">
              <h1 className="text-3xl font-display font-semibold text-foreground">{product.name}</h1>
              <p className="font-mono text-xs text-muted-foreground">{product.path}</p>
            </div>

            {images.length > 1 ? (
              <p className="text-sm text-muted-foreground">{images.length} product photos</p>
            ) : null}

            <Link
              href="/#contact"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Request a quote
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
