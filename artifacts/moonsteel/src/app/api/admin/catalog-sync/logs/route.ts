import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { listSyncLogs } from "@/features/catalog-sync/connections/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const logs = await listSyncLogs(auth.ctx.admin, {
    limit: Number(url.searchParams.get("limit") || 80),
    productId: url.searchParams.get("productId") || undefined,
    platform: url.searchParams.get("platform") || undefined,
  });
  return NextResponse.json({ logs });
}
