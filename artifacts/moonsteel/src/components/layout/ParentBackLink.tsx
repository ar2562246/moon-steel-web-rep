import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type ParentBackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function ParentBackLink({ href, label, className }: ParentBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:mb-8",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to {label}
    </Link>
  );
}
