import { CATALOG_CAPABILITIES, type SocialProvider } from "../../core/types";
import { commonCatalogIssues } from "../../core/validate-product";
import { metaAccessToken, metaGraphRequest } from "./graph";
import { deleteMetaCatalogProduct, upsertMetaCatalogProduct } from "./catalog";

export const META_PROVIDER_ID = "meta";

export function createMetaProvider(): SocialProvider {
  return {
    id: META_PROVIDER_ID,
    label: "Meta",
    platforms: [
      {
        id: "facebook",
        providerId: META_PROVIDER_ID,
        label: "Facebook",
        shortLabel: "FB",
        description: "Meta Commerce catalog used by Facebook Shops and catalog ads.",
      },
      {
        id: "instagram",
        providerId: META_PROVIDER_ID,
        label: "Instagram",
        shortLabel: "IG",
        description: "Same Meta catalog, visible on Instagram Shopping when the account is eligible.",
      },
    ],
    capabilities: () => CATALOG_CAPABILITIES,
    async validateConnection(ctx) {
      const token = metaAccessToken(ctx.connection.credentials);
      const me = await metaGraphRequest<{ name?: string; id?: string }>("me", {
        accessToken: token,
        search: { fields: "id,name" },
      });
      return { ok: true, displayName: me.name || "Meta account" };
    },
    async validateProduct(product) {
      const issues = commonCatalogIssues(product, { requirePrice: true, requireHttpsImage: true });
      return { ok: issues.length === 0, issues };
    },
    async createProduct(product, ctx) {
      return upsertMetaCatalogProduct(product, ctx);
    },
    async updateProduct(product, ctx, externalProductId) {
      return upsertMetaCatalogProduct(product, ctx, externalProductId);
    },
    async deleteProduct(product, ctx) {
      return deleteMetaCatalogProduct(product, ctx);
    },
    async unpublishProduct(product, ctx, externalProductId) {
      const unpublished = {
        ...product,
        availability: "out_of_stock" as const,
      };
      return upsertMetaCatalogProduct(unpublished, ctx, externalProductId);
    },
  };
}
