import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Single parent fade-in driven entirely by CSS (see .motion-reveal in index.css).
 * Children stay static — no per-card observers, no hydration dependency.
 */
export function SectionReveal({ children, className }: SectionRevealProps) {
  return <div className={cn("motion-reveal", className)}>{children}</div>;
}
