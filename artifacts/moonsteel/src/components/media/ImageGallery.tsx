"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      if (!scroller || images.length === 0) return;
      const next = Math.min(images.length - 1, Math.max(0, index));
      scroller.scrollTo({
        left: next * scroller.clientWidth,
        behavior: "smooth",
      });
      setActiveIndex(next);
    },
    [images.length]
  );

  const onScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActiveIndex(Math.min(images.length - 1, Math.max(0, next)));
  }, [images.length]);

  useEffect(() => {
    setActiveIndex(0);
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTo({ left: 0, behavior: "auto" });
  }, [images]);

  useEffect(() => {
    if (images.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goTo, images.length]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="overflow-hidden bg-muted max-md:-mx-4 md:rounded-2xl">
        <img src={images[0]} alt={title} loading="eager" decoding="async" className="aspect-[4/3] w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-3">
      <div className="relative max-md:-mx-4">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="w-full min-w-full shrink-0 snap-start snap-always basis-full"
            >
              <div className="overflow-hidden bg-muted md:rounded-2xl">
                <img
                  src={image}
                  alt={`${title} — photo ${index + 1} of ${images.length}`}
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="pointer-events-none aspect-[4/3] w-full object-contain select-none"
                />
              </div>
            </div>
          ))}
        </div>
        {/* Arrows are desktop-only; mobile uses swipe + dots/thumbs */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full border-border bg-background/90 shadow-sm backdrop-blur-sm md:inline-flex"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous photo"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full border-border bg-background/90 shadow-sm backdrop-blur-sm md:inline-flex"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === images.length - 1}
          aria-label="Next photo"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1 md:hidden" role="tablist" aria-label="Photo position">
        {images.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            onClick={() => goTo(index)}
            className="flex h-11 w-11 items-center justify-center"
            aria-label={`Go to photo ${index + 1}`}
            aria-current={activeIndex === index ? true : undefined}
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/35"
              )}
            />
          </button>
        ))}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
        {images.map((image, index) => (
          <button
            key={`thumb-${image}-${index}`}
            type="button"
            onClick={() => goTo(index)}
            className={cn(
              "h-14 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-16 sm:w-24",
              activeIndex === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
            aria-label={`View photo ${index + 1}`}
            aria-current={activeIndex === index ? true : undefined}
          >
            <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
