import { productContentHash } from "./hash";
import { SYNC_ERROR_CODES, toSyncError } from "./errors";
import type { ProviderRegistry } from "./registry";
import type {
  ConnectionRecord,
  ItemAction,
  NormalizedProduct,
  ProductSyncState,
  ProviderOperationResult,
  SocialProvider,
  SyncAction,
  SyncStatus,
} from "./types";

export type SyncEngineRepos = {
  getConnectionForPlatform(platformId: string): Promise<ConnectionRecord | null>;
  getSyncState(productId: string, platformId: string, connectionId: string): Promise<ProductSyncState | null>;
  upsertSyncState(input: {
    productId: string;
    productName: string;
    productSlug: string;
    connectionId: string;
    provider: string;
    platform: string;
    accountKey: string;
    status: SyncStatus;
    externalProductId?: string | null;
    externalUrl?: string | null;
    contentHash?: string | null;
    lastError?: string | null;
    lastErrorCode?: string | null;
    lastErrorDetail?: string | null;
    lastSyncedAt?: string | null;
  }): Promise<ProductSyncState>;
};

export type SyncEngineResult = {
  platformId: string;
  providerId: string;
  action: ItemAction;
  status: SyncStatus;
  ok: boolean;
  skipped: boolean;
  retryable: boolean;
  externalProductId: string | null;
  externalUrl: string | null;
  error: string | null;
  errorCode: string | null;
  errorDetail: string | null;
  contentHash: string;
};

function nextStatus(action: SyncAction, result: ProviderOperationResult): SyncStatus {
  if (result.skipped && (action === "UNPUBLISH" || action === "DELETE")) return "UNPUBLISHED";
  if (result.skipped) return "NOT_SYNCED";
  if (!result.ok) {
    if (result.errorCode === SYNC_ERROR_CODES.TOKEN_EXPIRED) return "DISCONNECTED";
    return "FAILED";
  }
  if (action === "VALIDATE") return "NOT_SYNCED";
  if (action === "UNPUBLISH" || action === "DELETE") return "UNPUBLISHED";
  return "SYNCED";
}

export function resolveItemAction(action: SyncAction, existing: ProductSyncState | null): ItemAction {
  if (action === "VALIDATE") return "VALIDATE";
  if (action === "UNPUBLISH") return "UNPUBLISH";
  if (action === "DELETE") return "DELETE";
  return existing?.externalProductId ? "UPDATE" : "CREATE";
}

function fail(
  platformId: string,
  providerId: string,
  action: ItemAction,
  contentHash: string,
  error: string,
  errorCode: string,
  extra?: { skipped?: boolean; status?: SyncStatus; externalProductId?: string | null; externalUrl?: string | null }
): SyncEngineResult {
  return {
    platformId,
    providerId,
    action,
    status: extra?.status ?? "FAILED",
    ok: false,
    skipped: extra?.skipped ?? false,
    retryable: false,
    externalProductId: extra?.externalProductId ?? null,
    externalUrl: extra?.externalUrl ?? null,
    error,
    errorCode,
    errorDetail: null,
    contentHash,
  };
}

export function createSyncEngine(registry: ProviderRegistry, repos: SyncEngineRepos) {
  async function persist(input: {
    product: NormalizedProduct;
    productSlug: string;
    platformId: string;
    connection: ConnectionRecord;
    provider: SocialProvider;
    status: SyncStatus;
    contentHash: string;
    externalProductId?: string | null;
    externalUrl?: string | null;
    error?: string | null;
    errorCode?: string | null;
    errorDetail?: string | null;
  }) {
    const synced = input.status === "SYNCED";
    return repos.upsertSyncState({
      productId: input.product.id,
      productName: input.product.title,
      productSlug: input.productSlug,
      connectionId: input.connection.id,
      provider: input.provider.id,
      platform: input.platformId,
      accountKey: input.connection.accountKey,
      status: input.status,
      externalProductId: input.externalProductId ?? null,
      externalUrl: input.externalUrl ?? null,
      contentHash: synced ? input.contentHash : undefined,
      lastError: input.error ?? null,
      lastErrorCode: input.errorCode ?? null,
      lastErrorDetail: input.errorDetail ?? null,
      lastSyncedAt: synced ? new Date().toISOString() : undefined,
    });
  }

  async function run(input: {
    product: NormalizedProduct;
    productSlug: string;
    platformId: string;
    action: SyncAction;
  }): Promise<SyncEngineResult> {
    const contentHash = productContentHash(input.product);
    const platform = registry.platform(input.platformId);
    if (!platform) {
      return fail(input.platformId, "unknown", "SKIP", contentHash, "Unknown platform.", SYNC_ERROR_CODES.UNSUPPORTED);
    }

    const provider = registry.get(platform.providerId);
    if (!provider) {
      return fail(
        input.platformId,
        platform.providerId,
        "SKIP",
        contentHash,
        "Provider is not registered.",
        SYNC_ERROR_CODES.UNSUPPORTED
      );
    }

    const connection = await repos.getConnectionForPlatform(input.platformId);
    if (!connection || connection.status !== "connected") {
      return fail(
        input.platformId,
        platform.providerId,
        "SKIP",
        contentHash,
        `${platform.label} is not connected.`,
        SYNC_ERROR_CODES.DISCONNECTED,
        { skipped: true, status: "DISCONNECTED" }
      );
    }

    const capabilities = provider.capabilities(input.platformId);
    const existing = await repos.getSyncState(input.product.id, input.platformId, connection.id);
    const itemAction = resolveItemAction(input.action, existing);

    const unsupportedMessage =
      input.action === "SYNC" && itemAction === "CREATE" && !capabilities.canCreateProduct
        ? "Creating catalog products is not supported on this platform."
        : input.action === "SYNC" && itemAction === "UPDATE" && !capabilities.canUpdateProduct
          ? "Updating catalog products is not supported on this platform."
          : input.action === "DELETE" && !capabilities.canDeleteProduct
            ? "Removing catalog products is not supported on this platform."
            : input.action === "UNPUBLISH" && !capabilities.canUnpublish
              ? "Unpublishing catalog products is not supported on this platform."
              : null;

    if (unsupportedMessage) {
      return fail(
        input.platformId,
        provider.id,
        itemAction,
        contentHash,
        unsupportedMessage,
        SYNC_ERROR_CODES.UNSUPPORTED,
        { skipped: true, status: "NOT_SYNCED", externalProductId: existing?.externalProductId }
      );
    }

    const ctx = { connection, platformId: input.platformId };
    const validation = await provider.validateProduct(input.product, ctx);
    if (!validation.ok) {
      const message = validation.issues[0]?.message ?? "Product is not ready for this platform.";
      const detail = validation.issues.map((issue) => issue.message).join(" | ");
      if (input.action !== "VALIDATE") {
        await persist({
          ...input,
          connection,
          provider,
          status: "FAILED",
          contentHash,
          externalProductId: existing?.externalProductId,
          externalUrl: existing?.externalUrl,
          error: message,
          errorCode: SYNC_ERROR_CODES.VALIDATION,
          errorDetail: detail,
        });
      }
      return {
        platformId: input.platformId,
        providerId: provider.id,
        action: itemAction,
        status: input.action === "VALIDATE" ? "NOT_SYNCED" : "FAILED",
        ok: false,
        skipped: false,
        retryable: false,
        externalProductId: existing?.externalProductId ?? null,
        externalUrl: existing?.externalUrl ?? null,
        error: message,
        errorCode: SYNC_ERROR_CODES.VALIDATION,
        errorDetail: detail,
        contentHash,
      };
    }

    if (input.action === "VALIDATE") {
      return {
        platformId: input.platformId,
        providerId: provider.id,
        action: "VALIDATE",
        status: "NOT_SYNCED",
        ok: true,
        skipped: false,
        retryable: false,
        externalProductId: existing?.externalProductId ?? null,
        externalUrl: existing?.externalUrl ?? null,
        error: null,
        errorCode: null,
        errorDetail: null,
        contentHash,
      };
    }

    let result: ProviderOperationResult;
    try {
      result = await executeProvider(provider, itemAction, input.product, ctx, existing);
    } catch (error) {
      const syncError = toSyncError(error);
      result = {
        ok: false,
        action: itemAction,
        retryable: syncError.retryable,
        error: syncError.message,
        errorCode: syncError.code,
        errorDetail: syncError.detail,
      };
    }

    const status = nextStatus(input.action, result);
    const state = await persist({
      ...input,
      connection,
      provider,
      status,
      contentHash,
      externalProductId: result.externalProductId ?? existing?.externalProductId,
      externalUrl: result.externalUrl ?? existing?.externalUrl,
      error: result.ok ? null : result.error,
      errorCode: result.ok ? null : result.errorCode,
      errorDetail: result.ok ? null : result.errorDetail,
    });

    return {
      platformId: input.platformId,
      providerId: provider.id,
      action: result.action,
      status: state.status,
      ok: result.ok,
      skipped: Boolean(result.skipped),
      retryable: Boolean(result.retryable),
      externalProductId: state.externalProductId,
      externalUrl: state.externalUrl,
      error: result.error ?? null,
      errorCode: result.errorCode ?? null,
      errorDetail: result.errorDetail ?? null,
      contentHash,
    };
  }

  return { run };
}

async function executeProvider(
  provider: SocialProvider,
  action: ItemAction,
  product: NormalizedProduct,
  ctx: { connection: ConnectionRecord; platformId: string },
  existing: ProductSyncState | null
): Promise<ProviderOperationResult> {
  if (action === "CREATE") return provider.createProduct(product, ctx);
  if (action === "UPDATE") {
    return provider.updateProduct(product, ctx, existing?.externalProductId || product.id);
  }
  if (action === "DELETE") {
    if (!existing?.externalProductId) return { ok: true, action: "SKIP", skipped: true };
    return provider.deleteProduct(product, ctx, existing.externalProductId);
  }
  if (action === "UNPUBLISH") {
    if (!existing?.externalProductId) return { ok: true, action: "SKIP", skipped: true };
    return provider.unpublishProduct(product, ctx, existing.externalProductId);
  }
  return { ok: true, action: "VALIDATE" };
}

export function shouldRetry(result: Pick<SyncEngineResult, "ok" | "retryable" | "errorCode">, attempt: number) {
  if (result.ok) return false;
  if (!result.retryable) return false;
  if (result.errorCode === SYNC_ERROR_CODES.VALIDATION) return false;
  return attempt < 3;
}

export function backoffMs(attempt: number) {
  return Math.min(8000, 500 * 2 ** attempt);
}
