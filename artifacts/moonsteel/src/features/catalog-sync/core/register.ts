import { createMockProvider, MOCK_PLATFORM_ID } from "../providers/mock/provider";
import { createMetaProvider } from "../providers/meta/provider";
import { createWhatsAppProvider } from "../providers/whatsapp/provider";
import { createGoogleProvider } from "../providers/google/provider";
import { providerRegistry } from "../core/registry";

let registered = false;

export function isMockSyncEnabled() {
  if (process.env.CATALOG_SYNC_ENABLE_MOCK === "true") return true;
  if (process.env.CATALOG_SYNC_ENABLE_MOCK === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function registerCatalogSyncProviders() {
  if (registered) return providerRegistry;
  providerRegistry.register(createMetaProvider());
  providerRegistry.register(createWhatsAppProvider());
  providerRegistry.register(createGoogleProvider());
  if (isMockSyncEnabled()) {
    providerRegistry.register(createMockProvider());
  }
  registered = true;
  return providerRegistry;
}

export function visiblePlatforms() {
  return registerCatalogSyncProviders().platforms().filter((platform) => {
    if (platform.id === MOCK_PLATFORM_ID) return isMockSyncEnabled();
    return true;
  });
}

export { providerRegistry };
