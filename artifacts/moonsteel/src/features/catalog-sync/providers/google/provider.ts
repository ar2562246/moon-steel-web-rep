import { CATALOG_CAPABILITIES, type SocialProvider } from "../../core/types";
import { commonCatalogIssues } from "../../core/validate-product";
import { SyncError, SYNC_ERROR_CODES } from "../../core/errors";
import { googleMerchantRequest, refreshGoogleAccessToken } from "./client";
import { googleProductInputName, toGoogleProductInput } from "./transform";

export const GOOGLE_PROVIDER_ID = "google";

function merchantConfig(ctx: { connection: { config: Record<string, unknown> } }) {
  const accountId = ctx.connection.config.merchantId;
  const dataSource = ctx.connection.config.dataSource;
  const feedLabel = typeof ctx.connection.config.feedLabel === "string" ? ctx.connection.config.feedLabel : "PK";
  if (typeof accountId !== "string" || !accountId) {
    throw new SyncError("Select a Google Merchant Center account before syncing.", {
      code: SYNC_ERROR_CODES.VALIDATION,
    });
  }
  if (typeof dataSource !== "string" || !dataSource) {
    throw new SyncError("Select a Merchant Center API data source before syncing.", {
      code: SYNC_ERROR_CODES.VALIDATION,
    });
  }
  return { accountId, dataSource, feedLabel };
}

export function createGoogleProvider(): SocialProvider {
  const provider: SocialProvider = {
    id: GOOGLE_PROVIDER_ID,
    label: "Google",
    platforms: [
      {
        id: "google",
        providerId: GOOGLE_PROVIDER_ID,
        label: "Google Merchant Center",
        shortLabel: "G",
        description: "Google Merchant Center product catalog. Business Profile posts are a separate surface and are not synced here.",
      },
    ],
    capabilities: () => CATALOG_CAPABILITIES,
    async validateConnection(ctx) {
      const token = await refreshGoogleAccessToken(ctx.connection.credentials);
      const { accountId } = merchantConfig(ctx);
      await googleMerchantRequest(`https://merchantapi.googleapis.com/accounts/v1/accounts/${accountId}`, {
        accessToken: token,
      });
      return { ok: true, displayName: ctx.connection.displayName || `Merchant ${accountId}` };
    },
    async validateProduct(product) {
      const issues = commonCatalogIssues(product, { requirePrice: true, requireHttpsImage: true });
      return { ok: issues.length === 0, issues };
    },
    async createProduct(product, ctx) {
      const token = await refreshGoogleAccessToken(ctx.connection.credentials);
      const { accountId, dataSource, feedLabel } = merchantConfig(ctx);
      const body = toGoogleProductInput(product, feedLabel);
      await googleMerchantRequest(
        `https://merchantapi.googleapis.com/products/v1/accounts/${accountId}/productInputs:insert`,
        {
          accessToken: token,
          method: "POST",
          search: { dataSource: `accounts/${accountId}/dataSources/${dataSource}` },
          body,
        }
      );
      return {
        ok: true,
        action: "CREATE",
        externalProductId: googleProductInputName(accountId, product, feedLabel),
        externalUrl: product.canonicalUrl,
      };
    },
    async updateProduct(product, ctx) {
      const created = await provider.createProduct(product, ctx);
      return { ...created, action: "UPDATE" };
    },
    async deleteProduct(product, ctx) {
      const token = await refreshGoogleAccessToken(ctx.connection.credentials);
      const { accountId, dataSource, feedLabel } = merchantConfig(ctx);
      await googleMerchantRequest(
        `https://merchantapi.googleapis.com/products/v1/${googleProductInputName(accountId, product, feedLabel)}`,
        {
          accessToken: token,
          method: "DELETE",
          search: { dataSource: `accounts/${accountId}/dataSources/${dataSource}` },
        }
      );
      return { ok: true, action: "DELETE", externalProductId: null };
    },
    async unpublishProduct(product, ctx, externalProductId) {
      return provider.updateProduct({ ...product, availability: "out_of_stock" }, ctx, externalProductId);
    },
  };
  return provider;
}
