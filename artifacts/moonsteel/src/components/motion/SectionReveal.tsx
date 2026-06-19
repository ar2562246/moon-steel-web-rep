"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSectionReveal } from "@/hooks/use-motion-reveal";
import { cn } from "@/lib/utils";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Single parent opacity reveal — children stay static (no per-card observers).
 */
export function SectionReveal({ children, className }: SectionRevealProps) {
  const { disabled, initial, whileInView, viewport, transition } = useSectionReveal();

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("motion-reveal", className)}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
