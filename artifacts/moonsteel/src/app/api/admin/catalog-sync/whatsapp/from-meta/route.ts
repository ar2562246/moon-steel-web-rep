import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectedProvider, upsertConnection } from "@/features/catalog-sync/connections/store";
import { metaAccessToken } from "@/features/catalog-sync/providers/meta/graph";
import {
  isWhatsAppBusinessAccountId,
  verifyWhatsAppBusinessAccount,
} from "@/features/catalog-sync/providers/whatsapp/account";
import { WHATSAPP_E164 } from "@/lib/contact/details";

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
  if (!catalogId) {
    return NextResponse.json(
      { error: "Select a Meta product catalog before linking WhatsApp." },
      { status: 400 }
    );
  }

  const requestedWaba = body.wabaId?.trim() || "";
  let wabaId: string | null = null;
  let displayName = body.displayName || "WhatsApp (Meta catalog)";
  let displayPhone: string | null = null;
  let displayPhoneDigits: string | null = WHATSAPP_E164;

  if (requestedWaba) {
    if (!isWhatsAppBusinessAccountId(requestedWaba)) {
      return NextResponse.json(
        {
          error:
            "That is not a WhatsApp Business Account ID. Leave it blank to use the Meta catalog (WhatsApp already updates when Facebook catalog updates), or paste the numeric WABA ID from Business Suite.",
        },
        { status: 400 }
      );
    }
    const check = await verifyWhatsAppBusinessAccount({
      accessToken: metaAccessToken(meta.credentials),
      wabaId: requestedWaba,
      catalogId,
      attachIfMissing: true,
    });
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }
    wabaId = check.wabaId;
    displayName = body.displayName || check.name || "WhatsApp Business";
    displayPhone = check.displayPhone;
    displayPhoneDigits = check.displayPhoneDigits || WHATSAPP_E164;
  }

  const connection = await upsertConnection(auth.ctx.admin, {
    provider: "whatsapp",
    displayName,
    status: "connected",
    connectedBy: auth.ctx.userId,
    credentials: meta.credentials,
    config: {
      wabaId,
      catalogId,
      catalogName: meta.config.catalogName ?? null,
      sharedMetaConnectionId: meta.id,
      displayPhone,
      displayPhoneDigits,
      mirrorsMetaCatalog: true,
    },
  });

  return NextResponse.json({ connection });
}
