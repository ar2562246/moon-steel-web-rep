export const SYNC_STATUSES = [
  "NOT_SYNCED",
  "SYNCING",
  "SYNCED",
  "UPDATE_REQUIRED",
  "FAILED",
  "UNPUBLISHED",
  "DISCONNECTED",
] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const JOB_STATUSES = ["QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_ITEM_STATUSES = ["QUEUED", "RUNNING", "SUCCESS", "FAILED", "SKIPPED"] as const;
export type JobItemStatus = (typeof JOB_ITEM_STATUSES)[number];

export const SYNC_ACTIONS = ["SYNC", "UNPUBLISH", "DELETE", "VALIDATE"] as const;
export type SyncAction = (typeof SYNC_ACTIONS)[number];

export const ITEM_ACTIONS = ["CREATE", "UPDATE", "DELETE", "UNPUBLISH", "VALIDATE", "SKIP"] as const;
export type ItemAction = (typeof ITEM_ACTIONS)[number];

export const CONNECTION_STATUSES = ["connected", "disconnected", "expired", "error"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const PRODUCT_AVAILABILITIES = [
  "in_stock",
  "out_of_stock",
  "preorder",
  "available_for_order",
] as const;
export type ProductAvailability = (typeof PRODUCT_AVAILABILITIES)[number];

export type ProviderCapabilities = {
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

export const CATALOG_CAPABILITIES: ProviderCapabilities = {
  canCreateProduct: true,
  canUpdateProduct: true,
  canDeleteProduct: true,
  canPublish: false,
  canUnpublish: true,
  supportsBulkSync: true,
  supportsDryRun: true,
  requiresPrice: true,
  requiresPublicImageUrl: true,
};

export type PlatformDefinition = {
  id: string;
  providerId: string;
  label: string;
  shortLabel: string;
  description: string;
};

export type NormalizedImage = {
  url: string;
  isPrimary: boolean;
};

export type NormalizedProduct = {
  id: string;
  title: string;
  description: string;
  sku: string;
  price: number | null;
  currency: string;
  availability: ProductAvailability;
  canonicalUrl: string;
  images: NormalizedImage[];
  category: string | null;
  brand: string;
  specifications: Record<string, string>;
  metadata: Record<string, string>;
};

export type ConnectionPublic = {
  id: string;
  provider: string;
  accountKey: string;
  displayName: string;
  status: ConnectionStatus;
  config: Record<string, unknown>;
  lastValidatedAt: string | null;
  lastError: string | null;
};

export type ConnectionRecord = ConnectionPublic & {
  credentials: Record<string, unknown>;
};

export type ProductSyncState = {
  id: string;
  productId: string | null;
  connectionId: string | null;
  provider: string;
  platform: string;
  accountKey: string;
  externalProductId: string | null;
  externalUrl: string | null;
  status: SyncStatus;
  contentHash: string | null;
  lastSyncedAt: string | null;
  lastAttemptedAt: string | null;
  lastError: string | null;
  lastErrorCode: string | null;
  productName: string | null;
  productSlug: string | null;
};

export type ValidationIssue = {
  field: string;
  message: string;
  fatal: boolean;
};

export type ProviderValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type ProviderOperationResult = {
  ok: boolean;
  action: ItemAction;
  externalProductId?: string | null;
  externalUrl?: string | null;
  skipped?: boolean;
  retryable?: boolean;
  error?: string;
  errorCode?: string;
  errorDetail?: string;
};

export type ProviderContext = {
  connection: ConnectionRecord;
  platformId: string;
};

export type SocialProvider = {
  id: string;
  label: string;
  platforms: PlatformDefinition[];
  capabilities(platformId: string): ProviderCapabilities;
  validateConnection(ctx: ProviderContext): Promise<{ ok: boolean; displayName?: string; error?: string }>;
  validateProduct(product: NormalizedProduct, ctx: ProviderContext): Promise<ProviderValidationResult>;
  createProduct(product: NormalizedProduct, ctx: ProviderContext): Promise<ProviderOperationResult>;
  updateProduct(
    product: NormalizedProduct,
    ctx: ProviderContext,
    externalProductId: string
  ): Promise<ProviderOperationResult>;
  deleteProduct(
    product: NormalizedProduct,
    ctx: ProviderContext,
    externalProductId: string
  ): Promise<ProviderOperationResult>;
  unpublishProduct(
    product: NormalizedProduct,
    ctx: ProviderContext,
    externalProductId: string
  ): Promise<ProviderOperationResult>;
  getStatus?(
    product: NormalizedProduct,
    ctx: ProviderContext,
    externalProductId: string
  ): Promise<{ exists: boolean; url?: string | null }>;
};
