import type { CatalogSyncPlatform, CatalogSyncState } from "@/features/admin/services/catalogSync";

function configString(config: Record<string, unknown> | undefined, key: string) {
  const value = config?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function canViewListing(state: CatalogSyncState | undefined) {
  if (!state?.externalProductId) return false;
  return state.status === "SYNCED" || state.status === "UPDATE_REQUIRED";
}

export function platformListingUrl(
  platform: Pick<CatalogSyncPlatform, "id" | "connection">,
  state: CatalogSyncState | undefined
): string | null {
  if (!canViewListing(state) || !state?.externalProductId) return null;

  const productId = state.productId;
  if ((platform.id === "facebook" || platform.id === "instagram" || platform.id === "whatsapp") && productId) {
    return `/api/admin/catalog-sync/view?platform=${encodeURIComponent(platform.id)}&productId=${encodeURIComponent(productId)}`;
  }

  const config = platform.connection?.config;
  const merchantId = configString(config, "merchantId");
  const feedLabel = configString(config, "feedLabel") || "PK";

  if (platform.id === "google" && merchantId) {
    const offerId = encodeURIComponent(state.externalProductId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 50));
    return `https://merchants.google.com/mc/items/details?a=${encodeURIComponent(merchantId)}&offerId=${offerId}&language=en&feedLabel=${encodeURIComponent(feedLabel)}`;
  }

  return null;
}
