export type CatalogSyncPlatform = {
  id: string;
  providerId: string;
  label: string;
  shortLabel: string;
  description: string;
  connected: boolean;
  capabilities?: {
    canCreateProduct: boolean;
    canUpdateProduct: boolean;
    canDeleteProduct: boolean;
    canPublish: boolean;
    canUnpublish: boolean;
    supportsBulkSync: boolean;
    supportsDryRun: boolean;
    requiresPrice: boolean;
    requiresPublicImageUrl: boolean;
  };
  connection: CatalogSyncConnection | null;
};

export type CatalogSyncConnection = {
  id: string;
  provider: string;
  accountKey: string;
  displayName: string;
  status: string;
  config: Record<string, unknown>;
  lastValidatedAt: string | null;
  lastError: string | null;
};

export type CatalogSyncState = {
  id: string;
  productId: string | null;
  platform: string;
  status: string;
  externalProductId: string | null;
  externalUrl: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastErrorCode: string | null;
};

export type CatalogSyncJob = {
  id: string;
  action: string;
  status: string;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string | null;
    platform: string;
    action: string;
    status: string;
    error: string | null;
    durationMs: number | null;
  }>;
};

async function readJson<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(json.error || "Request failed.");
  }
  return json;
}

export async function fetchCatalogSyncOverview() {
  const response = await fetch("/api/admin/catalog-sync/connections");
  return readJson<{ platforms: CatalogSyncPlatform[]; connections: CatalogSyncConnection[]; mockEnabled: boolean }>(
    response
  );
}

export async function fetchCatalogSyncStatus(productIds: string[]) {
  if (productIds.length === 0) return { states: [] as CatalogSyncState[], platforms: [] as CatalogSyncPlatform[] };
  const response = await fetch(
    `/api/admin/catalog-sync/status?productIds=${encodeURIComponent(productIds.join(","))}`
  );
  return readJson<{ states: CatalogSyncState[]; platforms: CatalogSyncPlatform[] }>(response);
}

export async function createCatalogSyncJob(input: {
  action: "SYNC" | "UNPUBLISH" | "DELETE" | "VALIDATE";
  productIds: string[] | "all";
  platformIds: string[];
  confirmAll?: boolean;
}) {
  const response = await fetch("/api/admin/catalog-sync/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await response.json().catch(() => ({}))) as {
    jobId?: string;
    totalItems?: number;
    requiresConfirmation?: boolean;
    productCount?: number;
    platformCount?: number;
    estimatedOperations?: number;
    error?: string;
  };
  if (response.status === 409 && json.requiresConfirmation) return json;
  if (!response.ok) throw new Error(json.error || "Could not start sync.");
  return json;
}

export async function fetchCatalogSyncJob(jobId: string) {
  const response = await fetch(`/api/admin/catalog-sync/jobs/${jobId}`);
  return readJson<CatalogSyncJob>(response);
}

export async function fetchCatalogSyncLogs(productId?: string) {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  const response = await fetch(`/api/admin/catalog-sync/logs${query}`);
  return readJson<{
    logs: Array<{
      id: string;
      created_at: string;
      product_name: string | null;
      platform: string;
      action: string;
      status: string;
      error: string | null;
      duration_ms: number | null;
    }>;
  }>(response);
}

export async function validateCatalogProduct(productId: string, platformIds: string[]) {
  const response = await fetch("/api/admin/catalog-sync/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, platformIds }),
  });
  return readJson<{
    results: Array<{ platformId: string; ok: boolean; issues: Array<{ field: string; message: string }> }>;
  }>(response);
}

export async function connectMockProvider(scenario = "success") {
  const response = await fetch("/api/admin/catalog-sync/connections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "mock", scenario }),
  });
  return readJson<{ connection: CatalogSyncConnection }>(response);
}

export async function disconnectCatalogConnection(id: string) {
  const response = await fetch(`/api/admin/catalog-sync/connections/${id}`, { method: "DELETE" });
  return readJson<{ ok: boolean }>(response);
}

export async function testCatalogConnection(id: string) {
  const response = await fetch(`/api/admin/catalog-sync/connections/${id}/test`, { method: "POST" });
  return readJson<{ ok: boolean; error?: string | null; displayName?: string }>(response);
}

export async function updateCatalogConnection(
  id: string,
  patch: { displayName?: string; config?: Record<string, unknown> }
) {
  const response = await fetch(`/api/admin/catalog-sync/connections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return readJson<{ ok: boolean }>(response);
}

export async function linkWhatsAppFromMeta(input: { wabaId?: string; catalogId: string; displayName?: string }) {
  const response = await fetch("/api/admin/catalog-sync/whatsapp/from-meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<{ connection: CatalogSyncConnection }>(response);
}
