"use client";

import { useEffect, useState } from "react";

export type ImageResolution = {
  width: number;
  height: number;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function formatAspectRatio(width: number, height: number) {
  const d = gcd(width, height);
  const w = width / d;
  const h = height / d;
  if (w <= 32 && h <= 32) return `${w}:${h}`;
  return `${(width / height).toFixed(2)}:1`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useImageResolution(src?: string | null) {
  const [resolution, setResolution] = useState<ImageResolution | null>(null);

  useEffect(() => {
    if (!src) {
      setResolution(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) {
        setResolution({ width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.onerror = () => {
      if (!cancelled) setResolution(null);
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolution;
}
