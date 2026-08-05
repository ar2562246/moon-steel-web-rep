"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const [visibleOnMount, setVisibleOnMount] = useState(false);

  // Content already on screen at hydration must not wait on a viewport callback.
  useEffect(() => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisibleOnMount(true);
    }
  }, [disabled]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("motion-reveal", className)}
      initial={initial}
      animate={visibleOnMount ? whileInView : undefined}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
