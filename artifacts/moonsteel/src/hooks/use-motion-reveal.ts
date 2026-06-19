"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

/**
 * Stable viewport — low amount, once only (avoids iOS re-entry jitter).
 */
export const REVEAL_VIEWPORT = { once: true, amount: 0.12 } as const;

const ease = [0.25, 0.1, 0.25, 1] as const;

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function subscribeNoop(_onStoreChange: () => void) {
  return () => {};
}

/**
 * One opacity fade per section block. Skips on prefers-reduced-motion and iOS Safari
 * (scroll + layered surfaces repaint badly with per-element motion).
 */
export function useSectionReveal() {
  const reduced = useReducedMotion();
  const ios = useSyncExternalStore(subscribeNoop, isIOSSafari, () => false);
  const disabled = Boolean(reduced) || ios;

  return {
    disabled,
    viewport: REVEAL_VIEWPORT,
    initial: disabled ? ({ opacity: 1 } as const) : ({ opacity: 0 } as const),
    whileInView: { opacity: 1 } as const,
    transition: { duration: disabled ? 0 : 0.4, ease },
  };
}

/** @deprecated Use useSectionReveal — per-card whileInView caused mobile flicker. */
export function useCardReveal() {
  return useSectionReveal();
}
