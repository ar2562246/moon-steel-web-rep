"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackContactClick } from "@/lib/analytics/gtag";

type ContactMethod = "whatsapp" | "phone" | "email";

type TrackedContactLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  method: ContactMethod;
};

export function TrackedContactLink({ method, onClick, ...props }: TrackedContactLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackContactClick(method);
    onClick?.(event);
  };

  return <a {...props} onClick={handleClick} />;
}
