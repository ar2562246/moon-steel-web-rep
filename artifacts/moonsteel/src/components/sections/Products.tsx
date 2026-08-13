import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/ui/CmsImage";
import { getCatalogCategoryHref } from "@/features/catalog/paths";
import type { CatalogCategoryCard } from "@/features/catalog/types";

type ProductsProps = {
  categories: CatalogCategoryCard[];
};

export function Products({ categories }: ProductsProps) {
  return (
    <section id="products" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 max-w-2xl md:mb-16">
          <h2 className="apple-section-title mb-6 section-title-accent">Product Categories.</h2>
          <p className="apple-section-copy">
            Browse commercial stainless steel equipment by category — then open any product for
            specifications and fabrication details.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={getCatalogCategoryHref(category.slug)}
                className="group layer-1 overflow-hidden rounded-xl transition-colors hover:border-primary/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {category.image_url ? (
                    <CmsImage
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={index < 4}
                      className="object-contain p-3 transition-transform duration-500 md:group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <h3 className="truncate text-base font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition-[opacity,transform] -translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
