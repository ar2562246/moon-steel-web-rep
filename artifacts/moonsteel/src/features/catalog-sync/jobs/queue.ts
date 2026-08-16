import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { registerCatalogSyncProviders } from "../core/register";
import type { SyncAction } from "../core/types";
import { getConnectedProvider } from "../connections/store";

export type CreatedSyncJob = {
  id: string;
  processToken: string;
  totalItems: number;
  platformIds: string[];
};

function connectedPlatformsFor(providerId: string, requested: string[]) {
  const platforms = registerCatalogSyncProviders()
    .platforms()
    .filter((platform) => platform.providerId === providerId)
    .map((platform) => platform.id);
  return requested.filter((id) => platforms.includes(id));
}

export async function createSyncJob(
  admin: SupabaseClient,
  input: {
    action: SyncAction;
    productIds: string[];
    platformIds: string[];
    requestedBy: string;
    productScope: "selected" | "all";
    productNames?: Record<string, { name: string; slug: string }>;
  }
): Promise<CreatedSyncJob> {
  const registry = registerCatalogSyncProviders();
  const platformIds = [...new Set(input.platformIds)].filter((id) => registry.platform(id));
  if (platformIds.length === 0) {
    throw new Error("Select at least one connected platform.");
  }
  if (input.productIds.length === 0) {
    throw new Error("Select at least one product.");
  }

  const items: Array<{
    product_id: string;
    product_name: string | null;
    product_slug: string | null;
    provider: string;
    platform: string;
    connection_id: string;
    action: string;
  }> = [];

  for (const platformId of platformIds) {
    const platform = registry.platform(platformId);
    if (!platform) continue;
    const connection = await getConnectedProvider(admin, platform.providerId);
    if (!connection) continue;
    const enabled = connectedPlatformsFor(platform.providerId, [platformId]);
    if (enabled.length === 0) continue;
    for (const productId of input.productIds) {
      items.push({
        product_id: productId,
        product_name: input.productNames?.[productId]?.name ?? null,
        product_slug: input.productNames?.[productId]?.slug ?? null,
        provider: platform.providerId,
        platform: platformId,
        connection_id: connection.id,
        action: input.action === "SYNC" ? "UPDATE" : input.action,
      });
    }
  }

  if (items.length === 0) {
    throw new Error("None of the selected platforms are connected.");
  }

  const processToken = randomBytes(24).toString("hex");
  const { data: job, error } = await admin
    .from("sync_jobs")
    .insert({
      action: input.action,
      status: "QUEUED",
      product_scope: input.productScope,
      platform_ids: platformIds,
      requested_by: input.requestedBy,
      process_token: processToken,
      total_items: items.length,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: itemError } = await admin.from("sync_job_items").insert(
    items.map((item) => ({
      ...item,
      job_id: job.id,
      status: "QUEUED",
    }))
  );
  if (itemError) throw itemError;

  return { id: job.id, processToken, totalItems: items.length, platformIds };
}

export async function getSyncJob(admin: SupabaseClient, jobId: string) {
  const { data: job, error } = await admin.from("sync_jobs").select("*").eq("id", jobId).maybeSingle();
  if (error) throw error;
  if (!job) return null;
  const { data: items, error: itemError } = await admin
    .from("sync_job_items")
    .select(
      "id,product_id,product_name,product_slug,provider,platform,action,status,attempt_count,external_product_id,error,error_code,duration_ms,started_at,finished_at"
    )
    .eq("job_id", jobId)
    .order("created_at");
  if (itemError) throw itemError;
  return { job, items: items ?? [] };
}

export async function cancelSyncJob(admin: SupabaseClient, jobId: string) {
  const { error } = await admin
    .from("sync_jobs")
    .update({ status: "CANCELLED", finished_at: new Date().toISOString() })
    .eq("id", jobId)
    .in("status", ["QUEUED", "RUNNING"]);
  if (error) throw error;
}
