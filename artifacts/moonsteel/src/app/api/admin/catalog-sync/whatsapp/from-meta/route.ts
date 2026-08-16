import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectedProvider, upsertConnection } from "@/features/catalog-sync/connections/store";
import { metaAccessToken } from "@/features/catalog-sync/providers/meta/graph";
import { verifyWhatsAppBusinessAccount } from "@/features/catalog-sync/providers/whatsapp/account";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const meta = await getConnectedProvider(auth.ctx.admin, "meta");
  if (!meta) {
    return NextResponse.json({ error: "Connect Meta first, then link WhatsApp Business." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    wabaId?: string;
    catalogId?: string;
    displayName?: string;
  };

  const catalogId = body.catalogId || (typeof meta.config.catalogId === "string" ? meta.config.catalogId : null);
  if (!body.wabaId || !catalogId) {
    return NextResponse.json(
      { error: "WhatsApp Business Account ID and catalog ID are required." },
      { status: 400 }
    );
  }

  const check = await verifyWhatsAppBusinessAccount({
    accessToken: metaAccessToken(meta.credentials),
    wabaId: body.wabaId,
    catalogId,
    attachIfMissing: true,
  });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  const connection = await upsertConnection(auth.ctx.admin, {
    provider: "whatsapp",
    displayName: body.displayName || check.name || "WhatsApp Business",
    status: "connected",
    connectedBy: auth.ctx.userId,
    credentials: meta.credentials,
    config: {
      wabaId: check.wabaId,
      catalogId,
      catalogName: meta.config.catalogName ?? null,
      sharedMetaConnectionId: meta.id,
      displayPhone: check.displayPhone,
      displayPhoneDigits: check.displayPhoneDigits,
    },
  });

  return NextResponse.json({ connection });
}
