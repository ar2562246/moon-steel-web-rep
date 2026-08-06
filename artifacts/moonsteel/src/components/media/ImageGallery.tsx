"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = ((index % images.length) + images.length) % images.length;
      setActiveIndex(next);
    },
    [images.length]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (images.length < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, images.length]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="layer-2 overflow-hidden rounded-2xl bg-muted">
        <img src={images[0]} alt={title} className="aspect-[4/3] w-full object-contain" />
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="layer-2 overflow-hidden rounded-2xl bg-muted">
          <img
            key={activeImage}
            src={activeImage}
            alt={`${title} — photo ${activeIndex + 1}`}
            className="aspect-[4/3] w-full object-contain animate-in fade-in duration-150"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute left-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-border bg-background/90 backdrop-blur-sm"
          onClick={goPrev}
          aria-label="Previous photo"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-border bg-background/90 backdrop-blur-sm"
          onClick={goNext}
          aria-label="Next photo"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`thumb-${image}-${index}`}
            type="button"
            onClick={() => goTo(index)}
            className={cn(
              "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
              activeIndex === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
            aria-label={`View photo ${index + 1}`}
            aria-current={activeIndex === index}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
