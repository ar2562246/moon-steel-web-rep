import { CATALOG_CAPABILITIES, type NormalizedProduct, type ProviderContext, type SocialProvider } from "../../core/types";
import { SyncError, SYNC_ERROR_CODES } from "../../core/errors";

export const MOCK_PROVIDER_ID = "mock";
export const MOCK_PLATFORM_ID = "mock";

type MockRecord = {
  id: string;
  product: NormalizedProduct;
  unpublished: boolean;
};

const store = new Map<string, MockRecord>();

function key(ctx: ProviderContext, productId: string) {
  return `${ctx.connection.id}:${productId}`;
}

function scenario(ctx: ProviderContext) {
  const value = ctx.connection.config.scenario;
  return typeof value === "string" ? value : "success";
}

function applyScenario(ctx: ProviderContext, product: NormalizedProduct) {
  const mode = scenario(ctx);
  if (mode === "token_expired") {
    throw new SyncError("Mock connection expired. Reconnect the development provider.", {
      code: SYNC_ERROR_CODES.TOKEN_EXPIRED,
      retryable: false,
    });
  }
  if (mode === "rate_limit") {
    throw new SyncError("Mock provider is rate-limiting requests.", {
      code: SYNC_ERROR_CODES.RATE_LIMITED,
      retryable: true,
    });
  }
  if (mode === "failure" || product.metadata.forceFail === "true") {
    throw new SyncError("Mock provider rejected this product.", {
      code: SYNC_ERROR_CODES.VALIDATION,
      retryable: false,
      detail: "Forced failure for development.",
    });
  }
}

export function resetMockCatalog() {
  store.clear();
}

export function getMockCatalog() {
  return [...store.values()];
}

export function createMockProvider(): SocialProvider {
  return {
    id: MOCK_PROVIDER_ID,
    label: "Development mock",
    platforms: [
      {
        id: MOCK_PLATFORM_ID,
        providerId: MOCK_PROVIDER_ID,
        label: "Mock catalog",
        shortLabel: "Mock",
        description: "Local catalog used to test sync without publishing live products.",
      },
    ],
    capabilities: () => ({
      ...CATALOG_CAPABILITIES,
      requiresPrice: false,
    }),
    async validateConnection() {
      return { ok: true, displayName: "Mock catalog" };
    },
    async validateProduct(product) {
      const issues = [];
      if (!product.title) issues.push({ field: "title", message: "Product name is required.", fatal: true });
      if (product.images.length === 0) {
        issues.push({ field: "images", message: "At least one product image is required.", fatal: true });
      }
      return { ok: issues.length === 0, issues };
    },
    async createProduct(product, ctx) {
      applyScenario(ctx, product);
      const id = key(ctx, product.id);
      store.set(id, { id, product, unpublished: false });
      return { ok: true, action: "CREATE", externalProductId: id, externalUrl: `mock://catalog/${product.id}` };
    },
    async updateProduct(product, ctx) {
      applyScenario(ctx, product);
      const id = key(ctx, product.id);
      const existing = store.get(id);
      store.set(id, { id, product, unpublished: existing?.unpublished ?? false });
      return { ok: true, action: existing ? "UPDATE" : "CREATE", externalProductId: id, externalUrl: `mock://catalog/${product.id}` };
    },
    async deleteProduct(product, ctx) {
      applyScenario(ctx, product);
      store.delete(key(ctx, product.id));
      return { ok: true, action: "DELETE", externalProductId: null };
    },
    async unpublishProduct(product, ctx) {
      applyScenario(ctx, product);
      const id = key(ctx, product.id);
      const existing = store.get(id);
      if (existing) store.set(id, { ...existing, unpublished: true });
      return { ok: true, action: "UNPUBLISH", externalProductId: id };
    },
    async getStatus(product, ctx) {
      const record = store.get(key(ctx, product.id));
      return { exists: Boolean(record) && !record?.unpublished, url: record ? `mock://catalog/${product.id}` : null };
    },
  };
}
