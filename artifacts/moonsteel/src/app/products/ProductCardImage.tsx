"use client";

import { useEffect, useState } from "react";
import { getCatalogProductImages } from "@/features/catalog/paths";
import type { CatalogProduct } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type ProductCardImageProps = {
  product: Pick<CatalogProduct, "name" | "image_url" | "image_urls">;
  priority?: boolean;
};

export function ProductCardImage({ product, priority = false }: ProductCardImageProps) {
  const images = getCatalogProductImages(product);
  const cover = images[0] ?? "";
  const nextImage = images[1];
  const [hovered, setHovered] = useState(false);
  const canPeek = Boolean(nextImage);

  useEffect(() => {
    if (!nextImage) return;
    const preload = new window.Image();
    preload.src = nextImage;
  }, [nextImage]);

  const activeSrc = hovered && nextImage ? nextImage : cover;
  if (!activeSrc) return <div className="aspect-[4/3] bg-muted" />;

  return (
    <div
      className="aspect-[4/3] overflow-hidden bg-muted"
      onMouseEnter={() => {
        if (canPeek) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        key={activeSrc}
        src={activeSrc}
        alt={product.name}
        className={cn(
          "h-full w-full object-contain",
          canPeek && "md:transition-opacity md:duration-150",
          hovered && nextImage && "animate-in fade-in duration-150"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
