"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setActiveIndex(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="layer-2 overflow-hidden rounded-2xl">
        <img src={images[0]} alt={title} className="aspect-[16/10] w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Carousel setApi={setApi} className="w-full">
        <div className="relative">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={`${image}-${index}`}>
                <div className="layer-2 overflow-hidden rounded-2xl">
                  <img
                    src={image}
                    alt={`${title} — photo ${index + 1}`}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 border-border bg-background/90 backdrop-blur-sm" />
          <CarouselNext className="right-3 border-border bg-background/90 backdrop-blur-sm" />
        </div>
      </Carousel>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`thumb-${image}-${index}`}
            type="button"
            onClick={() => api?.scrollTo(index)}
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
