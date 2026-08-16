"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageGallery } from "@/components/media/ImageGallery";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { getCatalogCategoryFilterPath, getCatalogProductImages } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";
import { catalogItem, trackViewItem } from "@/lib/analytics/gtag";
import { readProductBackLink, type ProductBackLink } from "@/features/catalog/product-back";
import { ProductBuyForm } from "@/app/products/[slug]/ProductBuyForm";
import { ProductShareBar } from "@/app/products/[slug]/ProductShareBar";

type ProductDetailViewProps = {
  product: CatalogProduct;
};

function defaultBackLink(isGreaseTrap: boolean): ProductBackLink {
  return isGreaseTrap
    ? { href: "/grease-traps", label: "grease traps" }
    : { href: "/products", label: "catalog" };
}

function resolveBackLink(isGreaseTrap: boolean): ProductBackLink {
  const remembered = readProductBackLink();
  if (remembered) return remembered;

  const fallback = defaultBackLink(isGreaseTrap);
  const referrer = document.referrer;
  if (!referrer) return fallback;

  try {
    const url = new URL(referrer);
    if (url.origin !== window.location.origin) return fallback;
    if (url.pathname === "/products") {
      return { href: `${url.pathname}${url.search}`, label: "catalog" };
    }
    if (url.pathname === "/grease-traps") {
      return { href: "/grease-traps", label: "grease traps" };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

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

function BuyJumpButton({ className }: { className?: string }) {
  return (
    <a
      href="#buy"
      className={
        className ??
        "inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      }
    >
      Buy
    </a>
  );
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const images = getCatalogProductImages(product);
  const isGreaseTrap = product.categories.some((category) => category.slug === "grease-traps");
  const [backLink, setBackLink] = useState<ProductBackLink>(() => defaultBackLink(isGreaseTrap));

  useEffect(() => {
    trackViewItem(catalogItem(product));
  }, [product.slug]);

  useEffect(() => {
    setBackLink(resolveBackLink(isGreaseTrap));
  }, [isGreaseTrap]);

  return (
    <main className="pt-20 pb-28 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink href={backLink.href} label={backLink.label} className="mb-3 md:mb-8" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start lg:gap-10 md:gap-6">
          <div className="space-y-5 md:space-y-6">
            <ImageGallery images={images} title={product.name} />

            <div className="space-y-3 lg:hidden">
              <CategoryPills product={product} />
              <h1 className="text-2xl font-display font-semibold leading-snug text-foreground">
                {product.name}
              </h1>
              <BuyJumpButton />
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-display font-semibold text-foreground md:text-xl">Product Details</h2>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {product.details}
              </p>
            </div>
          </div>

          <aside className="space-y-6 rounded-2xl border border-border p-6 layer-1">
            <div className="flex items-start justify-between gap-3">
              <div className="hidden min-w-0 flex-1 space-y-2 lg:block">
                <CategoryPills product={product} />
                <h1 className="text-3xl font-display font-semibold text-foreground">{product.name}</h1>
              </div>
              <ProductShareBar product={product} className="ml-auto shrink-0" />
            </div>

            {images.length > 1 ? (
              <p className="text-sm text-muted-foreground">{images.length} product photos</p>
            ) : null}

            <ProductBuyForm product={product} />
          </aside>
        </div>
      </div>
    </main>
  );
}
