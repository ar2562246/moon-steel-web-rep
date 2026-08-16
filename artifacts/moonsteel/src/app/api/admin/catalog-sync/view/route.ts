import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectionForPlatform } from "@/features/catalog-sync/connections/store";
import { metaAccessToken } from "@/features/catalog-sync/providers/meta/graph";
import {
  catalogListingRedirectUrl,
  digitsOnly,
  findMetaCatalogProductId,
} from "@/features/catalog-sync/providers/meta/catalog";
import { WHATSAPP_E164 } from "@/lib/contact/details";

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

  const destination = catalogListingRedirectUrl({
    platformId,
    catalogId,
    metaProductId,
    pageUsername: configString(connection.config, "pageUsername"),
    pageId: configString(connection.config, "pageId"),
    instagramUsername: configString(connection.config, "instagramUsername"),
    whatsappPhone:
      configString(connection.config, "displayPhoneDigits") ||
      digitsOnly(configString(connection.config, "displayPhone")) ||
      WHATSAPP_E164,
  });

  return NextResponse.redirect(destination);
}
