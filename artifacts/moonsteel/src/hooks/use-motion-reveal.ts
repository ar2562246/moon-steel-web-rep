"use client";

import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

/** Single IntersectionObserver root — share across staggered lists */
export const REVEAL_VIEWPORT = { once: true, amount: 0.15 } as const;

const listContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

/** Enhanced: opacity + subtle y translate for depth. */
const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/** For larger elements with more dramatic entrance */
const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/** Scale + opacity for impact elements */
const scaleItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const staticVariants: Variants = {
  hidden: {},
  show: {},
};

/**
 * One staggered parent + enhanced opacity/transform fades per item. Honors prefers-reduced-motion.
 */
export function useMotionReveal() {
  const reduced = useReducedMotion();
  const skip = reduced ?? false;

  return {
    viewport: REVEAL_VIEWPORT,
    listContainerVariants: skip ? staticVariants : listContainerVariants,
    listItemVariants: skip ? staticVariants : listItemVariants,
    heroItemVariants: skip ? staticVariants : heroItemVariants,
    scaleItemVariants: skip ? staticVariants : scaleItemVariants,
  };
}
