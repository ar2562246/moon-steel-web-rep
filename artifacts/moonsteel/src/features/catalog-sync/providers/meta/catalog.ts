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

  const response = await metaGraphRequest<BatchResponse>(`${catalogId(ctx)}/items_batch`, {
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

  return {
    ok: true,
    action: method === "DELETE" ? "DELETE" : method === "CREATE" ? "CREATE" : "UPDATE",
    externalProductId: product.id,
    externalUrl: product.canonicalUrl,
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
