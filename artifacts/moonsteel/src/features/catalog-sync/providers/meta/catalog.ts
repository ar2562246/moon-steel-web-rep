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

export function metaCommerceManagerUrl(catalogId: string, metaProductId?: string | null) {
  const catalog = encodeURIComponent(catalogId);
  if (metaProductId) {
    return `https://business.facebook.com/latest/commerce_manager/catalog/product_details?asset_id=${catalog}&product_id=${encodeURIComponent(metaProductId)}`;
  }
  return `https://business.facebook.com/latest/commerce_manager/catalog?asset_id=${catalog}`;
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
