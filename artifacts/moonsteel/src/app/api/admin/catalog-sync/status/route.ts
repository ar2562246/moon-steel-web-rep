import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { listSyncStatesForProducts } from "@/features/catalog-sync/connections/store";
import { visiblePlatforms } from "@/features/catalog-sync/core/register";
import { listPublicConnections } from "@/features/catalog-sync/connections/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const ids = new URL(request.url).searchParams.get("productIds");
  const productIds = ids ? ids.split(",").filter(Boolean) : [];
  if (productIds.length === 0) {
    return NextResponse.json({ states: [], platforms: visiblePlatforms() });
  }
  const [states, connections] = await Promise.all([
    listSyncStatesForProducts(auth.ctx.admin, productIds),
    listPublicConnections(auth.ctx.admin),
  ]);
  return NextResponse.json({
    states,
    platforms: visiblePlatforms().map((platform) => ({
      ...platform,
      connected: connections.some((item) => item.provider === platform.providerId && item.status === "connected"),
    })),
  });
}
