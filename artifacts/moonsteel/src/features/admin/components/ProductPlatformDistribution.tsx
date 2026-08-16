"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createCatalogSyncJob,
  fetchCatalogSyncLogs,
  fetchCatalogSyncStatus,
  validateCatalogProduct,
  type CatalogSyncPlatform,
  type CatalogSyncState,
} from "@/features/admin/services/catalogSync";
import { PlatformStatusDot, platformStatusLabel } from "@/features/admin/components/PlatformStatusDot";
import { SyncJobProgressDialog } from "@/features/admin/components/SyncJobProgressDialog";

function formatWhen(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ProductPlatformDistribution({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<CatalogSyncPlatform[]>([]);
  const [states, setStates] = useState<CatalogSyncState[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [unpublishTarget, setUnpublishTarget] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ id: string; created_at: string; platform: string; action: string; status: string; error: string | null }>>([]);

  const load = async () => {
    const [status, history] = await Promise.all([
      fetchCatalogSyncStatus([productId]),
      fetchCatalogSyncLogs(productId),
    ]);
    setPlatforms(status.platforms);
    setStates(status.states.filter((row) => row.productId === productId));
    setLogs(history.logs.slice(0, 8));
    setSelected((current) =>
      current.length > 0 ? current : status.platforms.filter((platform) => platform.connected).map((platform) => platform.id)
    );
  };

  useEffect(() => {
    void load().catch((error) => {
      toast({
        title: "Could not load platform status",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    });
  }, [productId]);

  const connected = useMemo(() => platforms.filter((platform) => platform.connected), [platforms]);

  const stateFor = (platformId: string) => states.find((row) => row.platform === platformId);

  const startJob = async (action: "SYNC" | "UNPUBLISH" | "DELETE" | "VALIDATE", platformIds: string[]) => {
    if (platformIds.length === 0) {
      toast({ title: "Select at least one connected platform.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const result = await createCatalogSyncJob({
        action,
        productIds: [productId],
        platformIds,
      });
      if (result.jobId) setJobId(result.jobId);
    } catch (error) {
      toast({
        title: "Could not start sync",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const onCheck = async () => {
    setBusy(true);
    try {
      const result = await validateCatalogProduct(productId, selected.length ? selected : connected.map((item) => item.id));
      const next: Record<string, string> = {};
      for (const row of result.results) {
        next[row.platformId] = row.ok ? "Ready" : row.issues[0]?.message || "Not ready";
      }
      setChecks(next);
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <div>
        <h3 className="text-sm font-semibold">Platform distribution</h3>
        <p className="text-xs text-muted-foreground">
          The website catalog is the master record. External catalogs update only when you sync.
        </p>
      </div>

      <div className="space-y-2">
        {platforms.map((platform) => {
          const state = stateFor(platform.id);
          const checked = selected.includes(platform.id);
          return (
            <label
              key={platform.id}
              className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <Checkbox
                checked={checked}
                disabled={!platform.connected}
                onCheckedChange={(value) => {
                  setSelected((current) =>
                    value === true ? [...current, platform.id] : current.filter((id) => id !== platform.id)
                  );
                }}
                className="mt-1"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{platform.label}</span>
                  <PlatformStatusDot
                    label={platform.shortLabel}
                    status={platform.connected ? state?.status : "DISCONNECTED"}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {platform.connected
                    ? `${platformStatusLabel(state?.status)} · Last sync: ${formatWhen(state?.lastSyncedAt ?? null)}`
                    : "Not connected"}
                </p>
                {state?.externalProductId ? (
                  <p className="break-all text-[11px] text-muted-foreground">External ID: {state.externalProductId}</p>
                ) : null}
                {state?.lastError ? <p className="text-xs text-destructive">{state.lastError}</p> : null}
                {checks[platform.id] ? (
                  <p className="text-xs text-muted-foreground">Check: {checks[platform.id]}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!platform.connected || busy}
                  onClick={() => void startJob("SYNC", [platform.id])}
                >
                  Sync
                </Button>
                {platform.capabilities.canUnpublish && state?.externalProductId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => setUnpublishTarget(platform.id)}
                  >
                    Unpublish
                  </Button>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy || connected.length === 0} onClick={() => void startJob("SYNC", selected)}>
          Sync selected
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || connected.length === 0}
          onClick={() => void startJob("SYNC", connected.map((item) => item.id))}
        >
          Sync all available platforms
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void onCheck()}>
          Check before sync
        </Button>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Recent activity</p>
          {logs.map((log) => (
            <p key={log.id} className="text-xs text-muted-foreground">
              {formatWhen(log.created_at)} · {log.platform} · {log.action} · {log.status}
              {log.error ? ` — ${log.error}` : ""}
            </p>
          ))}
        </div>
      ) : null}

      <SyncJobProgressDialog
        jobId={jobId}
        onClose={() => {
          setJobId(null);
          void load();
        }}
      />

      <AlertDialog open={Boolean(unpublishTarget)} onOpenChange={(open) => !open && setUnpublishTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish from {unpublishTarget}?</AlertDialogTitle>
            <AlertDialogDescription>
              {productName} stays on the Moon Steel website. This only removes or marks it unavailable on the selected
              platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unpublishTarget) void startJob("UNPUBLISH", [unpublishTarget]);
                setUnpublishTarget(null);
              }}
            >
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
