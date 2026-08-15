"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLogoutButton } from "@/features/admin/components/AdminLogoutButton";
import { cn } from "@/lib/utils";

export function AdminToolbar({ nav }: { nav: ReactNode }) {
  const pathname = usePathname();
  const onSecurity = pathname.startsWith("/admin/security");

  return (
    <header className="shrink-0 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-none items-center gap-2 px-2 md:px-3">
        <Link href="/admin" className="shrink-0" aria-label="Admin dashboard">
          <img src="/ms3-logo.svg" alt="" className="h-7 w-7 object-contain" />
        </Link>
        {nav}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant={onSecurity ? "default" : "outline"}
            size="icon"
            type="button"
            className={cn("h-9 w-9", onSecurity && "pointer-events-none")}
            asChild
          >
            <Link href="/admin/security" aria-label="Login security" title="Login security">
              <Shield className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" type="button" className="h-9 w-9" asChild>
            <Link href="/" target="_blank" rel="noreferrer" aria-label="View site" title="View site">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}
