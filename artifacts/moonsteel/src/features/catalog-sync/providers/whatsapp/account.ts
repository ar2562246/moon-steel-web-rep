import { digitsOnly } from "../meta/catalog";
import { metaGraphRequest } from "../meta/graph";
import { isWhatsAppBusinessAccountId } from "./ids";

export { isWhatsAppBusinessAccountId } from "./ids";

export type WhatsAppAccountCheck =
  | {
      ok: true;
      wabaId: string;
      name: string | null;
      displayPhone: string | null;
      displayPhoneDigits: string | null;
      catalogLinked: boolean;
    }
  | { ok: false; error: string };

function missingWabaMessage() {
  return "That ID is not a WhatsApp Business Account this Meta login can access. Open Meta Business Suite → Accounts → WhatsApp accounts and copy the WABA ID from there. A Facebook Page ID, catalog ID, or personal WhatsApp number will not work.";
}

export async function verifyWhatsAppBusinessAccount(options: {
  accessToken: string;
  wabaId: string;
  catalogId: string;
  attachIfMissing?: boolean;
}): Promise<WhatsAppAccountCheck> {
  const wabaId = options.wabaId.trim();
  const catalogId = options.catalogId.trim();
  if (!wabaId) {
    return { ok: false, error: "Enter a WhatsApp Business Account ID." };
  }
  if (!isWhatsAppBusinessAccountId(wabaId)) {
    return { ok: false, error: missingWabaMessage() };
  }
  if (!catalogId) {
    return { ok: false, error: "Select a Meta product catalog before linking WhatsApp." };
  }

  let waba: { id?: string; name?: string };
  try {
    waba = await metaGraphRequest(`${wabaId}`, {
      accessToken: options.accessToken,
      search: { fields: "id,name" },
    });
  } catch {
    return { ok: false, error: missingWabaMessage() };
  }

  const phones = await metaGraphRequest<{
    data?: Array<{ id?: string; display_phone_number?: string }>;
  }>(`${wabaId}/phone_numbers`, {
    accessToken: options.accessToken,
    search: { fields: "id,display_phone_number" },
  }).catch(() => ({ data: [] as Array<{ id?: string; display_phone_number?: string }> }));

  const displayPhone = phones.data?.[0]?.display_phone_number ?? null;
  const displayPhoneDigits = digitsOnly(displayPhone);

  let catalogs: { data?: Array<{ id: string }> };
  try {
    catalogs = await metaGraphRequest(`${wabaId}/product_catalogs`, {
      accessToken: options.accessToken,
    });
  } catch {
    return { ok: false, error: missingWabaMessage() };
  }

  let catalogLinked = (catalogs.data ?? []).some((item) => item.id === catalogId);
  if (!catalogLinked && options.attachIfMissing) {
    try {
      await metaGraphRequest(`${wabaId}/product_catalogs`, {
        accessToken: options.accessToken,
        method: "POST",
        search: { catalog_id: catalogId },
      });
      catalogLinked = true;
    } catch {
      return {
        ok: false,
        error: `WhatsApp Manager does not have catalog ${catalogId} attached. In WhatsApp Manager, connect this catalog to the business number, then try again.`,
      };
    }
  }

  if (!catalogLinked) {
    return {
      ok: false,
      error: "The selected catalog is not linked to this WhatsApp Business Account.",
    };
  }

  return {
    ok: true,
    wabaId: waba.id || wabaId,
    name: waba.name ?? null,
    displayPhone,
    displayPhoneDigits,
    catalogLinked: true,
  };
}
