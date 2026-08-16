import { describe, expect, it, beforeEach } from "vitest";
import { ProviderRegistry } from "./registry";
import { createSyncEngine, resolveItemAction, shouldRetry } from "./engine";
import { productContentHash } from "./hash";
import { commonCatalogIssues } from "./validate-product";
import { SYNC_ERROR_CODES } from "./errors";
import { createMockProvider, resetMockCatalog, getMockCatalog } from "../providers/mock/provider";
import { toMetaCatalogItem } from "../providers/meta/transform";
import { googleOfferId, toGoogleProductInput } from "../providers/google/transform";
import type { ConnectionRecord, NormalizedProduct, ProductSyncState, SyncStatus } from "./types";

function product(overrides: Partial<NormalizedProduct> = {}): NormalizedProduct {
  return {
    id: "prod-1",
    title: "SS 304 Grease Trap",
    description: "Commercial grease interceptor.",
    sku: "GT-221512",
    price: 150000,
    currency: "PKR",
    availability: "in_stock",
    canonicalUrl: "https://moonsteelfab.com/products/ss-304-grease-trap",
    images: [{ url: "https://cdn.example.com/trap.jpg", isPrimary: true }],
    category: "Grease Traps",
    brand: "Moon Steel Fabricators",
    specifications: {},
    metadata: {},
    ...overrides,
  };
}

function connection(): ConnectionRecord {
  return {
    id: "conn-1",
    provider: "mock",
    accountKey: "default",
    displayName: "Mock",
    status: "connected",
    config: { scenario: "success" },
    lastValidatedAt: null,
    lastError: null,
    credentials: {},
  };
}

function memoryRepos(initial?: ProductSyncState[]) {
  const states = new Map<string, ProductSyncState>();
  for (const state of initial ?? []) {
    states.set(`${state.productId}:${state.platform}:${state.connectionId}`, state);
  }
  return {
    states,
    repos: {
      async getConnectionForPlatform() {
        return connection();
      },
      async getSyncState(productId: string, platformId: string, connectionId: string) {
        return states.get(`${productId}:${platformId}:${connectionId}`) ?? null;
      },
      async upsertSyncState(input: {
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
      }) {
        const key = `${input.productId}:${input.platform}:${input.connectionId}`;
        const current = states.get(key);
        const next: ProductSyncState = {
          id: current?.id ?? key,
          productId: input.productId,
          connectionId: input.connectionId,
          provider: input.provider,
          platform: input.platform,
          accountKey: input.accountKey,
          externalProductId: input.externalProductId ?? current?.externalProductId ?? null,
          externalUrl: input.externalUrl ?? current?.externalUrl ?? null,
          status: input.status,
          contentHash: input.contentHash ?? current?.contentHash ?? null,
          lastSyncedAt: input.lastSyncedAt ?? current?.lastSyncedAt ?? null,
          lastAttemptedAt: new Date().toISOString(),
          lastError: input.lastError ?? null,
          lastErrorCode: input.lastErrorCode ?? null,
          productName: input.productName,
          productSlug: input.productSlug,
        };
        states.set(key, next);
        return next;
      },
    },
  };
}

describe("provider registry", () => {
  it("registers providers and resolves platforms without rewriting product code", () => {
    const registry = new ProviderRegistry().register(createMockProvider());
    expect(registry.get("mock")?.label).toContain("mock");
    expect(registry.providerForPlatform("mock")?.id).toBe("mock");
    expect(registry.platform("missing")).toBeUndefined();
  });
});

describe("content hash", () => {
  it("is stable for the same catalog fields and changes when price changes", () => {
    const first = productContentHash(product());
    expect(productContentHash(product())).toBe(first);
    expect(productContentHash(product({ price: 160000 }))).not.toBe(first);
    expect(productContentHash(product({ title: "Changed" }))).not.toBe(first);
  });
});

describe("validation", () => {
  it("requires price for commerce catalogs but not for mock", () => {
    const missingPrice = product({ price: null });
    const commerce = commonCatalogIssues(missingPrice, { requirePrice: true, requireHttpsImage: true });
    expect(commerce.some((issue) => issue.field === "price")).toBe(true);
    const mock = commonCatalogIssues(missingPrice, { requirePrice: false, requireHttpsImage: false });
    expect(mock.some((issue) => issue.field === "price")).toBe(false);
  });

  it("rejects localhost product links for commerce catalogs", () => {
    const local = product({ canonicalUrl: "http://localhost:3000/products/ss-304-grease-trap" });
    expect(commonCatalogIssues(local, { requirePrice: true, requireHttpsImage: true }).some((issue) => issue.field === "url")).toBe(
      true
    );
  });
});

describe("sync engine", () => {
  beforeEach(() => {
    resetMockCatalog();
  });

  function engine(repos = memoryRepos().repos) {
    const registry = new ProviderRegistry().register(createMockProvider());
    return createSyncEngine(registry, repos);
  }

  it("creates then updates instead of duplicating", async () => {
    const { repos, states } = memoryRepos();
    const sync = engine(repos);
    const created = await sync.run({
      product: product(),
      productSlug: "ss-304-grease-trap",
      platformId: "mock",
      action: "SYNC",
    });
    expect(created.ok).toBe(true);
    expect(created.action).toBe("CREATE");
    expect(created.status).toBe("SYNCED");

    const updated = await sync.run({
      product: product({ title: "SS 304 Grease Trap Large" }),
      productSlug: "ss-304-grease-trap",
      platformId: "mock",
      action: "SYNC",
    });
    expect(updated.ok).toBe(true);
    expect(updated.action).toBe("UPDATE");
    expect(getMockCatalog()).toHaveLength(1);
    expect([...states.values()][0]?.externalProductId).toBe(created.externalProductId);
  });

  it("marks failed sync without stopping later products in a loop", async () => {
    const { repos } = memoryRepos();
    const sync = engine(repos);
    const failed = await sync.run({
      product: product({ metadata: { forceFail: "true" } }),
      productSlug: "bad",
      platformId: "mock",
      action: "SYNC",
    });
    const ok = await sync.run({
      product: product({ id: "prod-2", sku: "OK-1" }),
      productSlug: "ok",
      platformId: "mock",
      action: "SYNC",
    });
    expect(failed.ok).toBe(false);
    expect(failed.status).toBe("FAILED");
    expect(ok.ok).toBe(true);
  });

  it("does not retry permanent validation failures", () => {
    expect(
      shouldRetry({ ok: false, retryable: false, errorCode: SYNC_ERROR_CODES.VALIDATION }, 0)
    ).toBe(false);
    expect(
      shouldRetry({ ok: false, retryable: true, errorCode: SYNC_ERROR_CODES.RATE_LIMITED }, 0)
    ).toBe(true);
  });

  it("chooses CREATE vs UPDATE from stored external id", () => {
    expect(resolveItemAction("SYNC", null)).toBe("CREATE");
    expect(
      resolveItemAction("SYNC", {
        id: "s1",
        productId: "prod-1",
        connectionId: "conn-1",
        provider: "mock",
        platform: "mock",
        accountKey: "default",
        externalProductId: "ext-1",
        externalUrl: null,
        status: "SYNCED",
        contentHash: "abc",
        lastSyncedAt: null,
        lastAttemptedAt: null,
        lastError: null,
        lastErrorCode: null,
        productName: "Trap",
        productSlug: "trap",
      })
    ).toBe("UPDATE");
  });

  it("skips unpublish when the product was never synced", async () => {
    const result = await engine().run({
      product: product(),
      productSlug: "ss-304-grease-trap",
      platformId: "mock",
      action: "UNPUBLISH",
    });
    expect(result.skipped).toBe(true);
    expect(result.ok).toBe(true);
  });

  it("maps expired mock tokens to DISCONNECTED without creating a catalog item", async () => {
    const { repos } = memoryRepos();
    const registry = new ProviderRegistry().register(createMockProvider());
    const sync = createSyncEngine(registry, {
      ...repos,
      async getConnectionForPlatform() {
        return { ...connection(), config: { scenario: "token_expired" } };
      },
    });
    const result = await sync.run({
      product: product(),
      productSlug: "ss-304-grease-trap",
      platformId: "mock",
      action: "SYNC",
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe("DISCONNECTED");
    expect(result.errorCode).toBe(SYNC_ERROR_CODES.TOKEN_EXPIRED);
    expect(getMockCatalog()).toHaveLength(0);
  });

  it("reports unsupported platforms instead of faking success", async () => {
    const result = await engine().run({
      product: product(),
      productSlug: "ss-304-grease-trap",
      platformId: "tiktok",
      action: "SYNC",
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe(SYNC_ERROR_CODES.UNSUPPORTED);
  });
});

describe("provider transformers", () => {
  it("maps Moon Steel products into Meta catalog fields", () => {
    const item = toMetaCatalogItem(product());
    expect(item.id).toBe("prod-1");
    expect(item.price).toBe("150000.00 PKR");
    expect(item.link).toBe("https://moonsteelfab.com/products/ss-304-grease-trap");
    expect(item.mobile_link).toBe(item.link);
    expect(item.brand).toBe("Moon Steel Fabricators");
  });

  it("maps Moon Steel products into Google Merchant inputs", () => {
    const input = toGoogleProductInput(product(), "PK");
    expect(input.offerId).toBe(googleOfferId(product()));
    expect(input.productAttributes.price?.currencyCode).toBe("PKR");
    expect(input.productAttributes.availability).toBe("IN_STOCK");
  });
});
