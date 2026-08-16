import type { SupabaseClient } from "@supabase/supabase-js";
import { catalogPublicOrigin } from "@/lib/site";
import { getCatalogProductById } from "@/features/catalog/queries";
import { createSyncEngine, shouldRetry, backoffMs } from "../core/engine";
import { registerCatalogSyncProviders } from "../core/register";
import { normalizeCatalogProductForSync } from "../core/normalize";
import {
  getConnectionForPlatform,
  getSyncState,
  insertSyncLog,
  upsertSyncState,
} from "../connections/store";
import type { SyncAction } from "../core/types";

const BATCH_SIZE = 4;
const MAX_MS = 18_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processSyncJob(
  admin: SupabaseClient,
  jobId: string,
  processToken: string
): Promise<{ done: boolean; processed: number }> {
  const { data: job, error } = await admin
    .from("sync_jobs")
    .select("id,action,status,process_token,requested_by,processed_items,success_count,failed_count,skipped_count,total_items")
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  if (!job || job.process_token !== processToken) {
    throw new Error("Invalid sync job token.");
  }
  if (job.status === "CANCELLED" || job.status === "COMPLETED") {
    return { done: true, processed: 0 };
  }

  const runningPatch: Record<string, unknown> = { status: "RUNNING" };
  if (job.status === "QUEUED") runningPatch.started_at = new Date().toISOString();
  await admin.from("sync_jobs").update(runningPatch).eq("id", jobId);

  const registry = registerCatalogSyncProviders();
  const engine = createSyncEngine(registry, {
    getConnectionForPlatform: (platformId) => getConnectionForPlatform(admin, platformId),
    getSyncState: (productId, platformId, connectionId) =>
      getSyncState(admin, productId, platformId, connectionId),
    upsertSyncState: (input) => upsertSyncState(admin, input),
  });

  const started = Date.now();
  let processed = 0;

  while (Date.now() - started < MAX_MS) {
    const { data: items, error: itemError } = await admin
      .from("sync_job_items")
      .select("*")
      .eq("job_id", jobId)
      .eq("status", "QUEUED")
      .order("created_at")
      .limit(BATCH_SIZE);
    if (itemError) throw itemError;
    if (!items || items.length === 0) break;

    for (const item of items) {
      const itemStarted = Date.now();
      await admin
        .from("sync_job_items")
        .update({ status: "RUNNING", started_at: new Date().toISOString(), attempt_count: item.attempt_count + 1 })
        .eq("id", item.id);

      const product = item.product_id ? await getCatalogProductById(admin, item.product_id) : null;
      if (!product) {
        await finishItem(admin, {
          jobId,
          itemId: item.id,
          status: "SKIPPED",
          error: "Product is no longer in the Moon Steel catalog. External listings were not changed.",
          durationMs: Date.now() - itemStarted,
          actorId: job.requested_by,
          productName: item.product_name,
          provider: item.provider,
          platform: item.platform,
          action: item.action,
        });
        processed += 1;
        continue;
      }

      const normalized = normalizeCatalogProductForSync(product, { siteOrigin: catalogPublicOrigin() });
      let result = await engine.run({
        product: normalized,
        productSlug: product.slug,
        platformId: item.platform,
        action: job.action as SyncAction,
      });

      if (shouldRetry(result, item.attempt_count + 1)) {
        await sleep(backoffMs(item.attempt_count));
        result = await engine.run({
          product: normalized,
          productSlug: product.slug,
          platformId: item.platform,
          action: job.action as SyncAction,
        });
      }

      const itemStatus = result.skipped ? "SKIPPED" : result.ok ? "SUCCESS" : "FAILED";
      await finishItem(admin, {
        jobId,
        itemId: item.id,
        status: itemStatus,
        error: result.error,
        errorCode: result.errorCode,
        errorDetail: result.errorDetail,
        externalProductId: result.externalProductId,
        durationMs: Date.now() - itemStarted,
        actorId: job.requested_by,
        productId: product.id,
        productName: product.name,
        provider: result.providerId,
        platform: result.platformId,
        action: result.action,
      });
      processed += 1;
    }
  }

  const { data: counts } = await admin.from("sync_job_items").select("status").eq("job_id", jobId);
  const success = (counts ?? []).filter((row) => row.status === "SUCCESS").length;
  const failed = (counts ?? []).filter((row) => row.status === "FAILED").length;
  const skipped = (counts ?? []).filter((row) => row.status === "SKIPPED").length;
  const doneCount = success + failed + skipped;
  const hasQueued = (counts ?? []).some((row) => row.status === "QUEUED");

  await admin
    .from("sync_jobs")
    .update({
      processed_items: doneCount,
      success_count: success,
      failed_count: failed,
      skipped_count: skipped,
      status: hasQueued ? "RUNNING" : failed > 0 && success === 0 ? "FAILED" : "COMPLETED",
      finished_at: hasQueued ? null : new Date().toISOString(),
    })
    .eq("id", jobId);

  return { done: !hasQueued, processed };
}

async function finishItem(
  admin: SupabaseClient,
  input: {
    jobId: string;
    itemId: string;
    status: "SUCCESS" | "FAILED" | "SKIPPED";
    error?: string | null;
    errorCode?: string | null;
    errorDetail?: string | null;
    externalProductId?: string | null;
    durationMs: number;
    actorId: string | null;
    productId?: string | null;
    productName?: string | null;
    provider: string;
    platform: string;
    action: string;
  }
) {
  await admin
    .from("sync_job_items")
    .update({
      status: input.status,
      error: input.error ?? null,
      error_code: input.errorCode ?? null,
      error_detail: input.errorDetail ?? null,
      external_product_id: input.externalProductId ?? null,
      finished_at: new Date().toISOString(),
      duration_ms: input.durationMs,
    })
    .eq("id", input.itemId);

  await insertSyncLog(admin, {
    jobId: input.jobId,
    jobItemId: input.itemId,
    productId: input.productId,
    productName: input.productName,
    provider: input.provider,
    platform: input.platform,
    action: input.action,
    status: input.status,
    actorId: input.actorId,
    externalProductId: input.externalProductId,
    error: input.error,
    errorCode: input.errorCode,
    errorDetail: input.errorDetail,
    durationMs: input.durationMs,
  });
}
