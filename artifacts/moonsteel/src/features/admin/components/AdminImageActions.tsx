"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Kept for call-site compatibility; all actions share one simple style. */
export type AdminImageActionTone =
  | "default"
  | "copy"
  | "download"
  | "edit"
  | "optimize"
  | "move"
  | "grip"
  | "accent"
  | "danger";

/** Light toolbar controls — one shared hover color. */
export const adminImageActionClassName =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35";

export function AdminImageActionButton({
  className,
  children,
  tone: _tone = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: AdminImageActionTone;
}) {
  void _tone;
  return (
    <button type="button" className={cn(adminImageActionClassName, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminImageActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-0.5", className)}>{children}</div>;
}
