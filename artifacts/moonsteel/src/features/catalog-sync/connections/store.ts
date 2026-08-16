import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptJson, encryptJson, hasEncryptionKey } from "./crypto";
import type {
  ConnectionPublic,
  ConnectionRecord,
  ConnectionStatus,
  ProductSyncState,
  SyncStatus,
} from "../core/types";
import { registerCatalogSyncProviders } from "../core/register";

type ConnectionRow = {
  id: string;
  provider: string;
  account_key: string;
  display_name: string;
  status: ConnectionStatus;
  config: Record<string, unknown> | null;
  last_validated_at: string | null;
  last_error: string | null;
};

type SyncRow = {
  id: string;
  product_id: string | null;
  connection_id: string | null;
  provider: string;
  platform: string;
  account_key: string;
  external_product_id: string | null;
  external_url: string | null;
  status: SyncStatus;
  content_hash: string | null;
  last_synced_at: string | null;
  last_attempted_at: string | null;
  last_error: string | null;
  last_error_code: string | null;
  product_name: string | null;
  product_slug: string | null;
};

function mapConnection(row: ConnectionRow, credentials: Record<string, unknown> = {}): ConnectionRecord {
  return {
    id: row.id,
    provider: row.provider,
    accountKey: row.account_key,
    displayName: row.display_name,
    status: row.status,
    config: row.config ?? {},
    lastValidatedAt: row.last_validated_at,
    lastError: row.last_error,
    credentials,
  };
}

function publicConnection(row: ConnectionRow): ConnectionPublic {
  const { credentials: _ignored, ...rest } = mapConnection(row);
  return rest;
}

function mapSync(row: SyncRow): ProductSyncState {
  return {
    id: row.id,
    productId: row.product_id,
    connectionId: row.connection_id,
    provider: row.provider,
    platform: row.platform,
    accountKey: row.account_key,
    externalProductId: row.external_product_id,
    externalUrl: row.external_url,
    status: row.status,
    contentHash: row.content_hash,
    lastSyncedAt: row.last_synced_at,
    lastAttemptedAt: row.last_attempted_at,
    lastError: row.last_error,
    lastErrorCode: row.last_error_code,
    productName: row.product_name,
    productSlug: row.product_slug,
  };
}

async function loadCredentials(admin: SupabaseClient, connectionId: string) {
  const { data, error } = await admin
    .from("platform_connection_secrets")
    .select("credentials_encrypted")
    .eq("connection_id", connectionId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.credentials_encrypted) return {};
  if (!hasEncryptionKey()) return {};
  return decryptJson(data.credentials_encrypted);
}

export async function listPublicConnections(admin: SupabaseClient): Promise<ConnectionPublic[]> {
  const { data, error } = await admin
    .from("platform_connections")
    .select("id,provider,account_key,display_name,status,config,last_validated_at,last_error")
    .order("provider");
  if (error) throw error;
  return ((data ?? []) as ConnectionRow[]).map(publicConnection);
}

export async function getConnectionRecord(
  admin: SupabaseClient,
  connectionId: string
): Promise<ConnectionRecord | null> {
  const { data, error } = await admin
    .from("platform_connections")
    .select("id,provider,account_key,display_name,status,config,last_validated_at,last_error")
    .eq("id", connectionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const credentials = await loadCredentials(admin, connectionId);
  return mapConnection(data as ConnectionRow, credentials);
}

export async function getConnectedProvider(
  admin: SupabaseClient,
  provider: string
): Promise<ConnectionRecord | null> {
  const { data, error } = await admin
    .from("platform_connections")
    .select("id,provider,account_key,display_name,status,config,last_validated_at,last_error")
    .eq("provider", provider)
    .eq("status", "connected")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const credentials = await loadCredentials(admin, data.id);
  return mapConnection(data as ConnectionRow, credentials);
}

export async function getConnectionForPlatform(admin: SupabaseClient, platformId: string) {
  const platform = registerCatalogSyncProviders().platform(platformId);
  if (!platform) return null;
  return getConnectedProvider(admin, platform.providerId);
}

export async function upsertConnection(
  admin: SupabaseClient,
  input: {
    provider: string;
    accountKey?: string;
    displayName: string;
    status: ConnectionStatus;
    config?: Record<string, unknown>;
    credentials?: Record<string, unknown>;
    connectedBy?: string;
    lastError?: string | null;
  }
) {
  const accountKey = input.accountKey ?? "default";
  const { data, error } = await admin
    .from("platform_connections")
    .upsert(
      {
        provider: input.provider,
        account_key: accountKey,
        display_name: input.displayName,
        status: input.status,
        config: input.config ?? {},
        connected_by: input.connectedBy ?? null,
        last_error: input.lastError ?? null,
        last_validated_at: input.status === "connected" ? new Date().toISOString() : null,
      },
      { onConflict: "provider,account_key" }
    )
    .select("id,provider,account_key,display_name,status,config,last_validated_at,last_error")
    .single();
  if (error) throw error;

  if (input.credentials) {
    if (!hasEncryptionKey()) {
      if (input.provider !== "mock") {
        throw new Error("SYNC_CREDENTIALS_ENCRYPTION_KEY is required to store platform credentials.");
      }
    } else {
      const encrypted = encryptJson(input.credentials);
      const { error: secretError } = await admin.from("platform_connection_secrets").upsert({
        connection_id: data.id,
        credentials_encrypted: encrypted,
        updated_at: new Date().toISOString(),
      });
      if (secretError) throw secretError;
    }
  }

  return publicConnection(data as ConnectionRow);
}

export async function updateConnectionConfig(
  admin: SupabaseClient,
  connectionId: string,
  patch: {
    displayName?: string;
    status?: ConnectionStatus;
    config?: Record<string, unknown>;
    lastError?: string | null;
    credentials?: Record<string, unknown>;
  }
) {
  const updates: Record<string, unknown> = {};
  if (patch.displayName !== undefined) updates.display_name = patch.displayName;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.config !== undefined) updates.config = patch.config;
  if (patch.lastError !== undefined) updates.last_error = patch.lastError;
  if (patch.status === "connected") updates.last_validated_at = new Date().toISOString();

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from("platform_connections").update(updates).eq("id", connectionId);
    if (error) throw error;
  }

  if (patch.credentials) {
    if (!hasEncryptionKey()) {
      throw new Error("SYNC_CREDENTIALS_ENCRYPTION_KEY is required to store platform credentials.");
    }
    const { error } = await admin.from("platform_connection_secrets").upsert({
      connection_id: connectionId,
      credentials_encrypted: encryptJson(patch.credentials),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}

export async function deleteConnection(admin: SupabaseClient, connectionId: string) {
  await admin
    .from("product_platform_sync")
    .update({ status: "DISCONNECTED", connection_id: null })
    .eq("connection_id", connectionId);
  const { error } = await admin.from("platform_connections").delete().eq("id", connectionId);
  if (error) throw error;
}

export async function listSyncStatesForProducts(admin: SupabaseClient, productIds: string[]) {
  if (productIds.length === 0) return [] as ProductSyncState[];
  const { data, error } = await admin
    .from("product_platform_sync")
    .select(
      "id,product_id,connection_id,provider,platform,account_key,external_product_id,external_url,status,content_hash,last_synced_at,last_attempted_at,last_error,last_error_code,product_name,product_slug"
    )
    .in("product_id", productIds);
  if (error) throw error;
  return ((data ?? []) as SyncRow[]).map(mapSync);
}

export async function getSyncState(
  admin: SupabaseClient,
  productId: string,
  platformId: string,
  connectionId: string
) {
  const { data, error } = await admin
    .from("product_platform_sync")
    .select(
      "id,product_id,connection_id,provider,platform,account_key,external_product_id,external_url,status,content_hash,last_synced_at,last_attempted_at,last_error,last_error_code,product_name,product_slug"
    )
    .eq("product_id", productId)
    .eq("platform", platformId)
    .eq("connection_id", connectionId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSync(data as SyncRow) : null;
}

export async function upsertSyncState(
  admin: SupabaseClient,
  input: {
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
  }
): Promise<ProductSyncState> {
  const existing = await getSyncState(admin, input.productId, input.platform, input.connectionId);
  const payload = {
    product_id: input.productId,
    product_name: input.productName,
    product_slug: input.productSlug,
    connection_id: input.connectionId,
    provider: input.provider,
    platform: input.platform,
    account_key: input.accountKey,
    status: input.status,
    external_product_id: input.externalProductId ?? existing?.externalProductId ?? null,
    external_url: input.externalUrl ?? existing?.externalUrl ?? null,
    content_hash: input.contentHash ?? existing?.contentHash ?? null,
    last_error: input.lastError ?? null,
    last_error_code: input.lastErrorCode ?? null,
    last_error_detail: input.lastErrorDetail ?? null,
    last_attempted_at: new Date().toISOString(),
    last_synced_at: input.lastSyncedAt ?? existing?.lastSyncedAt ?? null,
  };

  if (existing) {
    const { data, error } = await admin
      .from("product_platform_sync")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id,product_id,connection_id,provider,platform,account_key,external_product_id,external_url,status,content_hash,last_synced_at,last_attempted_at,last_error,last_error_code,product_name,product_slug"
      )
      .single();
    if (error) throw error;
    return mapSync(data as SyncRow);
  }

  const { data, error } = await admin
    .from("product_platform_sync")
    .insert(payload)
    .select(
      "id,product_id,connection_id,provider,platform,account_key,external_product_id,external_url,status,content_hash,last_synced_at,last_attempted_at,last_error,last_error_code,product_name,product_slug"
    )
    .single();
  if (error) throw error;
  return mapSync(data as SyncRow);
}

export async function listSyncLogs(
  admin: SupabaseClient,
  options: { limit?: number; productId?: string; platform?: string } = {}
) {
  let query = admin
    .from("sync_logs")
    .select(
      "id,job_id,product_id,product_name,provider,platform,action,status,actor_id,external_product_id,error,error_code,duration_ms,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 100);
  if (options.productId) query = query.eq("product_id", options.productId);
  if (options.platform) query = query.eq("platform", options.platform);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function insertSyncLog(
  admin: SupabaseClient,
  input: {
    jobId?: string | null;
    jobItemId?: string | null;
    productId?: string | null;
    productName?: string | null;
    provider: string;
    platform: string;
    action: string;
    status: string;
    actorId?: string | null;
    externalProductId?: string | null;
    error?: string | null;
    errorCode?: string | null;
    errorDetail?: string | null;
    durationMs?: number | null;
  }
) {
  const { error } = await admin.from("sync_logs").insert({
    job_id: input.jobId ?? null,
    job_item_id: input.jobItemId ?? null,
    product_id: input.productId ?? null,
    product_name: input.productName ?? null,
    provider: input.provider,
    platform: input.platform,
    action: input.action,
    status: input.status,
    actor_id: input.actorId ?? null,
    external_product_id: input.externalProductId ?? null,
    error: input.error ?? null,
    error_code: input.errorCode ?? null,
    error_detail: input.errorDetail ?? null,
    duration_ms: input.durationMs ?? null,
  });
  if (error) throw error;
}
