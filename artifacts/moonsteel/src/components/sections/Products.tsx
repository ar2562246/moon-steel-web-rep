"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/ui/CmsImage";
import { getCatalogCategoryFilterPath } from "@/features/catalog/paths";
import type { CatalogCategoryCard } from "@/features/catalog/types";

type ProductsProps = {
  categories: CatalogCategoryCard[];
};

const AUTO_SCROLL_PX_PER_FRAME = 0.55;

export function Products({ categories }: ProductsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const marqueeItems = useMemo(() => {
    if (categories.length === 0) return [];

    const minItemsPerSet = 6;
    const repeatCount = Math.max(2, Math.ceil(minItemsPerSet / categories.length));
    const baseSet = Array.from({ length: repeatCount }).flatMap((_, repeatIdx) =>
      categories.map((category) => ({
        category,
        key: `${category.id}-set-${repeatIdx}`,
      }))
    );

    // Two identical sets so we can loop by resetting scroll at the halfway point.
    return [...baseSet, ...baseSet].map((item, idx) => ({
      ...item,
      loopKey: `${item.key}-loop-${idx}`,
    }));
  }, [categories]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || categories.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    const tick = () => {
      if (!pausedRef.current) {
        const half = scroller.scrollWidth / 2;
        if (half > 0) {
          scroller.scrollLeft += AUTO_SCROLL_PX_PER_FRAME;
          if (scroller.scrollLeft >= half) {
            scroller.scrollLeft -= half;
          }
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;

      event.preventDefault();
      pausedRef.current = true;
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }

      scroller.scrollLeft += delta;
      const half = scroller.scrollWidth / 2;
      if (half > 0) {
        if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
        if (scroller.scrollLeft < 0) scroller.scrollLeft += half;
      }

      resumeTimerRef.current = window.setTimeout(() => {
        pausedRef.current = false;
        resumeTimerRef.current = null;
      }, 900);
    };

    const onUserScroll = () => {
      if (!pausedRef.current) return;
      // Keep seamless loop while the user drags/swipes.
      const half = scroller.scrollWidth / 2;
      if (half <= 0) return;
      if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
      if (scroller.scrollLeft < 0) scroller.scrollLeft += half;
    };

    frame = window.requestAnimationFrame(tick);
    scroller.addEventListener("wheel", onWheel, { passive: false });
    scroller.addEventListener("scroll", onUserScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("scroll", onUserScroll);
    };
  }, [categories.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  return (
    <section id="products" className="layer-0 py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="apple-section-title mb-6 section-title-accent">Product Categories.</h2>
            <p className="apple-section-copy">
              Browse commercial stainless steel equipment by category — then open any product for
              specifications and fabrication details.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div
            ref={scrollerRef}
            className="categories-carousel-scroller"
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={() => {
              pausedRef.current = false;
            }}
            onFocusCapture={pauseAutoScroll}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                pausedRef.current = false;
              }
            }}
            onPointerDown={pauseAutoScroll}
            onTouchStart={pauseAutoScroll}
            onTouchEnd={() => {
              if (resumeTimerRef.current !== null) {
                window.clearTimeout(resumeTimerRef.current);
              }
              resumeTimerRef.current = window.setTimeout(() => {
                pausedRef.current = false;
                resumeTimerRef.current = null;
              }, 900);
            }}
          >
            <div className="categories-carousel-track">
              {marqueeItems.map(({ category, loopKey }, index) => (
                <Link
                  key={loopKey}
                  href={getCatalogCategoryFilterPath(category.slug)}
                  className="categories-carousel-item group layer-1 overflow-hidden rounded-xl transition-colors hover:border-primary/40"
                  draggable={false}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {category.image_url ? (
                      <CmsImage
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="280px"
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
          </div>
        </div>
      ) : null}
    </section>
  );
}
