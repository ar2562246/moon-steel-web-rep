import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { listPublicConnections, listSyncStatesForProducts } from "@/features/catalog-sync/connections/store";
import { describeVisiblePlatforms } from "@/features/catalog-sync/core/register";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const ids = new URL(request.url).searchParams.get("productIds");
  const productIds = ids ? ids.split(",").filter(Boolean) : [];
  const connections = await listPublicConnections(auth.ctx.admin);
  const platforms = describeVisiblePlatforms(connections);
  if (productIds.length === 0) {
    return NextResponse.json({ states: [], platforms });
  }
  const states = await listSyncStatesForProducts(auth.ctx.admin, productIds);
  return NextResponse.json({
    states,
    platforms,
  });
}
