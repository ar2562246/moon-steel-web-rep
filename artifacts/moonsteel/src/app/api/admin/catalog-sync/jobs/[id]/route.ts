import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { cancelSyncJob, getSyncJob } from "@/features/catalog-sync/jobs/queue";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const result = await getSyncJob(auth.ctx.admin, id);
  if (!result) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  const { job, items } = result;
  return NextResponse.json({
    id: job.id,
    action: job.action,
    status: job.status,
    productScope: job.product_scope,
    platformIds: job.platform_ids,
    totalItems: job.total_items,
    processedItems: job.processed_items,
    successCount: job.success_count,
    failedCount: job.failed_count,
    skippedCount: job.skipped_count,
    startedAt: job.started_at,
    finishedAt: job.finished_at,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      platform: item.platform,
      action: item.action,
      status: item.status,
      error: item.error,
      durationMs: item.duration_ms,
    })),
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  await cancelSyncJob(auth.ctx.admin, id);
  return NextResponse.json({ ok: true });
}
