"use client";

import { type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function adminSidebarCardClass(selected: boolean) {
  return cn(
    "flex-none w-full min-w-0 overflow-hidden rounded-xl border text-left whitespace-normal transition-colors",
    selected
      ? "border-primary bg-primary text-primary-foreground shadow-md"
      : "layer-2 border-transparent hover:border-primary/40 hover:bg-muted/50"
  );
}

export function adminSidebarTitleClass(selected: boolean) {
  return cn(
    "break-words text-sm font-semibold leading-snug",
    selected ? "text-primary-foreground" : "text-foreground"
  );
}

export function adminSidebarMetaClass(selected: boolean) {
  return cn(
    "inline-block max-w-full break-words rounded-full px-2 py-0.5 text-[10px] leading-tight",
    selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
  );
}

export function adminSidebarMutedClass(selected: boolean) {
  return cn(
    "break-words text-[11px] leading-snug",
    selected ? "text-primary-foreground/80" : "text-muted-foreground"
  );
}

export function adminSidebarBodyClass() {
  return "min-w-0 flex-1 space-y-1 text-left";
}

export function AdminSidebarThumb({
  src,
  alt,
  contain = false,
  className,
}: {
  src?: string | null;
  alt: string;
  contain?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md bg-muted",
        className ?? "h-16 w-[4.75rem]"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", contain ? "object-contain" : "object-cover")}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] leading-tight text-muted-foreground">
          No image
        </div>
      )}
    </div>
  );
}

export function AdminSidebarCard({
  selected,
  onClick,
  children,
  className,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        adminSidebarCardClass(selected),
        compact && "flex items-center gap-2.5 p-2",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AdminSidebarEmpty({ children }: { children: ReactNode }) {
  return (
    <Card className="layer-2">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}

export function AdminSidebarSkeleton({ count = 4, withImage = false }: { count?: number; withImage?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn("layer-2 shrink-0 overflow-hidden rounded-xl", withImage && "flex items-center gap-2.5 p-2")}>
          {withImage ? <Skeleton className="h-16 w-[4.75rem] shrink-0 rounded-md" /> : null}
          <CardContent className="min-w-0 flex-1 space-y-2 p-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function AdminDetailSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-24 sm:block" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-28 w-full" />
      {withImage ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : null}
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export function AdminMasterDetail({
  title,
  description,
  addLabel,
  onAdd,
  addDisabled,
  headerActions,
  notice,
  error,
  sidebar,
  detailTitle,
  detailDescription,
  detailActions,
  isEditorOpen,
  skeleton,
  children,
  onBack,
  keepListOnMobile = false,
  formId,
  canSubmit,
  isSaving,
  submitLabel,
}: {
  title: string;
  description?: ReactNode;
  addLabel?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  headerActions?: ReactNode;
  notice?: ReactNode;
  error?: string | null;
  sidebar: ReactNode;
  detailTitle: string;
  detailDescription?: ReactNode;
  detailActions?: ReactNode;
  isEditorOpen: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  keepListOnMobile?: boolean;
  formId?: string;
  canSubmit?: boolean;
  isSaving?: boolean;
  submitLabel?: string;
}) {
  const hideListOnMobile = isEditorOpen && !keepListOnMobile;
  const hideDetailOnMobile = !isEditorOpen && !keepListOnMobile;
  const descriptionText = typeof description === "string" ? description : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {(notice || error) && (
        <div className={cn("shrink-0 px-2 pt-2 md:px-3", hideListOnMobile && "max-lg:hidden")}>
          {notice}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      )}

      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden",
          keepListOnMobile
            ? "grid-rows-[auto_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]"
            : "grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]"
        )}
      >
        <aside
          className={cn(
            "flex min-h-0 flex-col overflow-hidden lg:border-r lg:border-border",
            keepListOnMobile ? "lg:h-full" : "h-full",
            hideListOnMobile && "hidden lg:flex"
          )}
        >
          <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-border px-2 py-1.5 md:px-3">
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={descriptionText}>
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              {onAdd ? (
                <Button type="button" size="sm" onClick={onAdd} disabled={addDisabled}>
                  <Plus className="h-4 w-4" />
                  {addLabel ?? "Add"}
                </Button>
              ) : null}
            </div>
          </div>
          <div
            className={cn(
              "min-h-0 p-2",
              keepListOnMobile
                ? "flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:min-h-0 lg:flex-1 lg:space-y-2 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain lg:pb-0 [&_button]:min-w-[16rem] lg:[&_button]:min-w-0"
                : "min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain"
            )}
          >
            {sidebar}
          </div>
        </aside>

        <Card
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-none shadow-none ring-0 lg:rounded-none",
            hideDetailOnMobile && "hidden lg:flex"
          )}
        >
          <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-foreground">{detailTitle}</h2>
              {detailDescription && isEditorOpen ? (
                <p className="hidden truncate text-xs text-muted-foreground lg:block">{detailDescription}</p>
              ) : null}
            </div>
            {isEditorOpen ? (
              <div className="flex shrink-0 items-center gap-2">
                {detailActions}
                {onBack ? (
                  <Button type="button" variant="outline" size="sm" onClick={onBack}>
                    Close
                  </Button>
                ) : null}
                {formId ? (
                  <Button type="submit" size="sm" form={formId} disabled={!canSubmit || isSaving}>
                    {isSaving ? "Saving..." : submitLabel ?? "Save Changes"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {isEditorOpen ? children : (skeleton ?? <AdminDetailSkeleton />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
