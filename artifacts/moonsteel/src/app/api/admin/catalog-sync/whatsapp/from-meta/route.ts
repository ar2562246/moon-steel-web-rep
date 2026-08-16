import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectedProvider, upsertConnection } from "@/features/catalog-sync/connections/store";

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

  const connection = await upsertConnection(auth.ctx.admin, {
    provider: "whatsapp",
    displayName: body.displayName || "WhatsApp Business",
    status: "connected",
    connectedBy: auth.ctx.userId,
    credentials: meta.credentials,
    config: {
      wabaId: body.wabaId,
      catalogId,
      catalogName: meta.config.catalogName ?? null,
      sharedMetaConnectionId: meta.id,
    },
  });

  return NextResponse.json({ connection });
}
