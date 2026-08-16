"use client";

import { useEffect, useState } from "react";
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

export function SyncJobProgressDialog({
  jobId,
  onClose,
}: {
  jobId: string | null;
  onClose: () => void;
}) {
  const [job, setJob] = useState<CatalogSyncJob | null>(null);

  useEffect(() => {
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
    }, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId]);

  const percent = job && job.totalItems > 0 ? Math.round((job.processedItems / job.totalItems) * 100) : 0;
  const failed = job?.items.filter((item) => item.status === "FAILED") ?? [];

  return (
    <Dialog open={Boolean(jobId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sync progress</DialogTitle>
          <DialogDescription>
            Catalog updates run in the background. You can keep working in admin while this finishes.
          </DialogDescription>
        </DialogHeader>
        {job ? (
          <div className="space-y-4">
            <Progress value={percent} />
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Stat label="Products" value={`${job.processedItems} / ${job.totalItems}`} />
              <Stat label="Successful" value={String(job.successCount)} />
              <Stat label="Failed" value={String(job.failedCount)} />
              <Stat label="Skipped" value={String(job.skippedCount)} />
            </div>
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
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {job.status === "RUNNING" || job.status === "QUEUED" ? "Hide" : "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Starting job…</p>
        )}
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
