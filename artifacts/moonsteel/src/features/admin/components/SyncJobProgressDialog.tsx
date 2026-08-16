"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchCatalogSyncJob, type CatalogSyncJob } from "@/features/admin/services/catalogSync";

function actionLabel(action: string | undefined) {
  if (action === "UNPUBLISH") return "Unpublish";
  if (action === "DELETE") return "Remove";
  if (action === "VALIDATE") return "Check";
  return "Sync";
}

export function SyncJobProgressDialog({
  open,
  jobId,
  onClose,
}: {
  open: boolean;
  jobId: string | null;
  onClose: () => void;
}) {
  const [job, setJob] = useState<CatalogSyncJob | null>(null);

  useEffect(() => {
    if (!open) {
      setJob(null);
      return;
    }
    if (!jobId) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const next = await fetchCatalogSyncJob(jobId);
        if (!cancelled) setJob(next);
        return next.status === "COMPLETED" || next.status === "FAILED" || next.status === "CANCELLED";
      } catch {
        return false;
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick().then((done) => {
        if (done) window.clearInterval(timer);
      });
    }, 400);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [open, jobId]);

  const running = job?.status === "RUNNING" || job?.status === "QUEUED" || (open && !job);
  const finished = job?.status === "COMPLETED" || job?.status === "FAILED" || job?.status === "CANCELLED";
  const percent = job && job.totalItems > 0 ? Math.round((job.processedItems / job.totalItems) * 100) : 0;
  const active = job?.items.find((item) => item.status === "RUNNING");
  const queued = job?.items.filter((item) => item.status === "QUEUED").length ?? 0;
  const failed = job?.items.filter((item) => item.status === "FAILED") ?? [];
  const label = actionLabel(job?.action);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {finished ? `${label} finished` : `${label} in progress`}
          </DialogTitle>
          <DialogDescription>
            {job
              ? running
                ? `${label} is running. This dialog updates as each product finishes.`
                : job.status === "FAILED"
                  ? `${label} finished with errors. Review the list below.`
                  : `${label} finished.`
              : `${label} started. Preparing catalog updates…`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {job ? (
            <>
              <Progress value={running && percent === 0 ? 12 : percent} className={running && percent === 0 ? "animate-pulse" : undefined} />
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Stat label="Products" value={`${job.processedItems} / ${job.totalItems}`} />
                <Stat label="Successful" value={String(job.successCount)} />
                <Stat label="Failed" value={String(job.failedCount)} />
                <Stat label="Skipped" value={String(job.skippedCount)} />
              </div>
              {active ? (
                <p className="text-sm text-foreground">
                  Working on <span className="font-medium">{active.productName || "product"}</span>
                  {" · "}
                  {active.platform}
                  {queued > 0 ? ` · ${queued} remaining` : ""}
                </p>
              ) : running ? (
                <p className="text-sm text-muted-foreground">Updating catalog listings…</p>
              ) : null}
              {failed.length > 0 ? (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3 text-sm">
                  {failed.map((item) => (
                    <p key={item.id}>
                      <span className="font-medium">{item.productName || "Product"}</span>
                      {" · "}
                      {item.platform}
                      {item.error ? ` — ${item.error}` : ""}
                    </p>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Progress value={18} className="animate-pulse" />
              <p className="text-sm text-foreground">Sync started. Connecting to the catalog now…</p>
            </>
          )}
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {running ? "Hide" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
