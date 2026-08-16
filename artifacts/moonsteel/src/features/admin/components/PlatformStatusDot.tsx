"use client";

import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  SYNCED: "bg-emerald-600",
  UPDATE_REQUIRED: "bg-amber-500",
  FAILED: "bg-destructive",
  SYNCING: "bg-sky-500",
  UNPUBLISHED: "bg-muted-foreground",
  DISCONNECTED: "bg-muted-foreground",
  NOT_SYNCED: "bg-border",
};

export function platformStatusLabel(status?: string | null) {
  switch (status) {
    case "SYNCED":
      return "Synced";
    case "UPDATE_REQUIRED":
      return "Update required";
    case "FAILED":
      return "Failed";
    case "SYNCING":
      return "Syncing";
    case "UNPUBLISHED":
      return "Unpublished";
    case "DISCONNECTED":
      return "Disconnected";
    default:
      return "Not synced";
  }
}

export function PlatformStatusDot({
  status,
  label,
  title,
}: {
  status?: string | null;
  label: string;
  title?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1" title={title || `${label}: ${platformStatusLabel(status)}`}>
      <span className={cn("h-1.5 w-1.5 rounded-full", TONE[status || "NOT_SYNCED"] || TONE.NOT_SYNCED)} />
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    </span>
  );
}
