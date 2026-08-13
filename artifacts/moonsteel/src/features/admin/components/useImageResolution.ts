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

/** Common display ratios, checked within a small tolerance. */
const COMMON_ASPECTS: { label: string; value: number }[] = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 5 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:10", value: 16 / 10 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:1", value: 2 },
  { label: "21:9", value: 21 / 9 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "2:3", value: 2 / 3 },
  { label: "9:16", value: 9 / 16 },
];

export function formatAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) return "—";

  const ratio = width / height;

  // Prefer a named common ratio when close enough (e.g. 1600×1194 → 4:3).
  let best: { label: string; delta: number } | null = null;
  for (const aspect of COMMON_ASPECTS) {
    const delta = Math.abs(ratio - aspect.value) / aspect.value;
    if (delta <= 0.03 && (!best || delta < best.delta)) {
      best = { label: aspect.label, delta };
    }
  }
  if (best) return best.label;

  const d = gcd(width, height);
  const w = width / d;
  const h = height / d;
  if (w <= 40 && h <= 40) return `${w}:${h}`;

  // Last resort: keep it readable without the old "1.34:1" style.
  return `${ratio.toFixed(2)}`;
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
