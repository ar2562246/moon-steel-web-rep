import { SyncError, SYNC_ERROR_CODES } from "../../core/errors";
import type { NormalizedProduct, ProviderContext, ProviderOperationResult } from "../../core/types";
import { metaAccessToken, metaGraphRequest } from "./graph";
import { toMetaCatalogItem } from "./transform";

function catalogId(ctx: ProviderContext) {
  const id = ctx.connection.config.catalogId;
  if (typeof id !== "string" || !id) {
    throw new SyncError("Select a Meta product catalog before syncing.", {
      code: SYNC_ERROR_CODES.VALIDATION,
    });
  }
  return id;
}

type BatchResponse = {
  handles?: string[];
  validation_status?: Array<{
    retailer_id?: string;
    errors?: Array<{ message?: string }>;
    warnings?: Array<{ message?: string }>;
  }>;
};

export function digitsOnly(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits.length >= 8 ? digits : null;
}

export function metaCommerceManagerUrl(catalogId: string, _metaProductId?: string | null) {
  return `https://business.facebook.com/commerce/catalogs/${encodeURIComponent(catalogId)}`;
}

export function facebookShopUrl(input: { pageUsername?: string | null; pageId?: string | null }) {
  const handle = input.pageUsername?.replace(/^@/, "").trim() || input.pageId?.trim();
  if (!handle) return null;
  return `https://www.facebook.com/${encodeURIComponent(handle)}/shop/`;
}

export function instagramProfileUrl(username?: string | null) {
  const handle = username?.replace(/^@/, "").trim();
  if (!handle) return null;
  return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
}

export function whatsappStorefrontUrl(input: { phoneDigits?: string | null; metaProductId?: string | null }) {
  const phone = digitsOnly(input.phoneDigits);
  if (!phone) return null;
  if (input.metaProductId && /^\d+$/.test(input.metaProductId)) {
    return `https://wa.me/p/${input.metaProductId}/${phone}`;
  }
  return `https://wa.me/c/${phone}`;
}

export function catalogListingRedirectUrl(input: {
  platformId: string;
  catalogId: string;
  metaProductId?: string | null;
  pageUsername?: string | null;
  pageId?: string | null;
  instagramUsername?: string | null;
  whatsappPhone?: string | null;
}) {
  if (input.platformId === "whatsapp") {
    return (
      whatsappStorefrontUrl({ phoneDigits: input.whatsappPhone, metaProductId: input.metaProductId }) ??
      metaCommerceManagerUrl(input.catalogId)
    );
  }
  if (input.platformId === "instagram") {
    return instagramProfileUrl(input.instagramUsername) ?? metaCommerceManagerUrl(input.catalogId);
  }
  return metaCommerceManagerUrl(input.catalogId, input.metaProductId);
}

export async function findMetaCatalogProductId(options: {
  catalogId: string;
  retailerId: string;
  accessToken: string;
}): Promise<string | null> {
  const filter = JSON.stringify({ retailer_id: { eq: options.retailerId } });
  const listed = await metaGraphRequest<{ data?: Array<{ id?: string }> }>(`${options.catalogId}/products`, {
    accessToken: options.accessToken,
    search: { fields: "id,retailer_id", filter, limit: "5" },
  }).catch(() => ({ data: [] as Array<{ id?: string }> }));
  const match = listed.data?.find((item) => item.id);
  if (match?.id) return match.id;

  const direct = await metaGraphRequest<{ id?: string }>(`${options.catalogId}:${options.retailerId}`, {
    accessToken: options.accessToken,
    search: { fields: "id" },
  }).catch(() => ({ id: undefined as string | undefined }));
  return direct.id ?? null;
}

async function submitItem(
  product: NormalizedProduct,
  ctx: ProviderContext,
  method: "CREATE" | "UPDATE" | "DELETE"
): Promise<ProviderOperationResult> {
  const token = metaAccessToken(ctx.connection.credentials);
  const item = toMetaCatalogItem(product);
  const data =
    method === "DELETE"
      ? { id: product.id }
      : item;

  const catalog = catalogId(ctx);
  const response = await metaGraphRequest<BatchResponse>(`${catalog}/items_batch`, {
    accessToken: token,
    method: "POST",
    body: {
      item_type: "PRODUCT_ITEM",
      allow_upsert: true,
      requests: [{ method, data }],
    },
  });

  const validation = response.validation_status?.[0];
  const errorMessage = validation?.errors?.[0]?.message;
  if (errorMessage) {
    throw new SyncError(errorMessage, {
      code: SYNC_ERROR_CODES.VALIDATION,
      retryable: false,
      detail: errorMessage,
    });
  }

  const metaProductId =
    method === "DELETE"
      ? product.id
      : (await findMetaCatalogProductId({ catalogId: catalog, retailerId: product.id, accessToken: token }).catch(
          () => null
        )) ?? product.id;

  return {
    ok: true,
    action: method === "DELETE" ? "DELETE" : method === "CREATE" ? "CREATE" : "UPDATE",
    externalProductId: metaProductId,
    externalUrl: metaCommerceManagerUrl(catalog, metaProductId === product.id ? null : metaProductId),
  };
}

export async function upsertMetaCatalogProduct(
  product: NormalizedProduct,
  ctx: ProviderContext,
  existingId?: string
): Promise<ProviderOperationResult> {
  return submitItem(product, ctx, existingId ? "UPDATE" : "CREATE");
}

export async function deleteMetaCatalogProduct(
  product: NormalizedProduct,
  ctx: ProviderContext
): Promise<ProviderOperationResult> {
  return submitItem(product, ctx, "DELETE");
}
