import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { listCatalogProductIds, listAllCatalogProducts } from "@/features/catalog/queries";
import { createSyncJob } from "@/features/catalog-sync/jobs/queue";
import { scheduleSyncJob } from "@/features/catalog-sync/jobs/schedule";
import type { SyncAction } from "@/features/catalog-sync/core/types";

export const runtime = "nodejs";

const ACTIONS = new Set<SyncAction>(["SYNC", "UNPUBLISH", "DELETE", "VALIDATE"]);

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    productIds?: string[] | "all";
    platformIds?: string[];
    confirmAll?: boolean;
  };

  const action = ACTIONS.has(body.action as SyncAction) ? (body.action as SyncAction) : null;
  if (!action) {
    return NextResponse.json({ error: "Unsupported sync action." }, { status: 400 });
  }

  const platformIds = Array.isArray(body.platformIds)
    ? body.platformIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  if (platformIds.length === 0) {
    return NextResponse.json({ error: "Select at least one platform." }, { status: 400 });
  }

  let productIds: string[] = [];
  let productScope: "selected" | "all" = "selected";
  if (body.productIds === "all") {
    if (!body.confirmAll) {
      const ids = await listCatalogProductIds(auth.ctx.admin);
      return NextResponse.json(
        {
          error: "Confirmation required.",
          requiresConfirmation: true,
          productCount: ids.length,
          platformCount: platformIds.length,
          estimatedOperations: ids.length * platformIds.length,
        },
        { status: 409 }
      );
    }
    productIds = await listCatalogProductIds(auth.ctx.admin);
    productScope = "all";
  } else if (Array.isArray(body.productIds)) {
    productIds = body.productIds.filter((id): id is string => typeof id === "string" && id.length > 0);
  }

  if (productIds.length === 0) {
    return NextResponse.json({ error: "Select at least one product." }, { status: 400 });
  }

  const products = await listAllCatalogProducts(auth.ctx.admin);
  const names = Object.fromEntries(products.map((product) => [product.id, { name: product.name, slug: product.slug }]));

  try {
    const job = await createSyncJob(auth.ctx.admin, {
      action,
      productIds,
      platformIds,
      requestedBy: auth.ctx.userId,
      productScope,
      productNames: names,
    });
    scheduleSyncJob(job.id, job.processToken);
    return NextResponse.json({
      jobId: job.id,
      totalItems: job.totalItems,
      platformIds: job.platformIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create sync job." },
      { status: 400 }
    );
  }
}
