import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectionForPlatform } from "@/features/catalog-sync/connections/store";
import { metaAccessToken } from "@/features/catalog-sync/providers/meta/graph";
import { findMetaCatalogProductId, metaCommerceManagerUrl } from "@/features/catalog-sync/providers/meta/catalog";

export const runtime = "nodejs";

function configString(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const platformId = url.searchParams.get("platform")?.trim();
  const productId = url.searchParams.get("productId")?.trim();
  if (!platformId || !productId) {
    return NextResponse.json({ error: "platform and productId are required." }, { status: 400 });
  }

  const connection = await getConnectionForPlatform(auth.ctx.admin, platformId);
  if (!connection || connection.status !== "connected") {
    return NextResponse.json({ error: "That platform is not connected." }, { status: 404 });
  }

  const catalogId = configString(connection.config, "catalogId");
  const wabaId = configString(connection.config, "wabaId");

  if (platformId === "whatsapp" && !catalogId && wabaId) {
    return NextResponse.redirect(`https://business.facebook.com/latest/whatsapp_manager/catalog?asset_id=${encodeURIComponent(wabaId)}`);
  }

  if (!catalogId) {
    return NextResponse.json({ error: "Select a Meta product catalog before viewing." }, { status: 400 });
  }

  let metaProductId: string | null = null;
  try {
    metaProductId = await findMetaCatalogProductId({
      catalogId,
      retailerId: productId,
      accessToken: metaAccessToken(connection.credentials),
    });
  } catch {
    metaProductId = null;
  }

  return NextResponse.redirect(metaCommerceManagerUrl(catalogId, metaProductId));
}
