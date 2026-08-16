import { CATALOG_CAPABILITIES, type SocialProvider } from "../../core/types";
import { commonCatalogIssues } from "../../core/validate-product";
import { metaAccessToken, metaGraphRequest } from "../meta/graph";
import { deleteMetaCatalogProduct, upsertMetaCatalogProduct } from "../meta/catalog";
import { verifyWhatsAppBusinessAccount } from "./account";
import { isWhatsAppBusinessAccountId } from "./ids";

export const WHATSAPP_PROVIDER_ID = "whatsapp";

export function createWhatsAppProvider(): SocialProvider {
  return {
    id: WHATSAPP_PROVIDER_ID,
    label: "WhatsApp Business",
    platforms: [
      {
        id: "whatsapp",
        providerId: WHATSAPP_PROVIDER_ID,
        label: "WhatsApp Business",
        shortLabel: "WA",
        description: "Same Meta catalog as Facebook. WhatsApp shows those items once the catalog is attached in WhatsApp Manager.",
      },
    ],
    capabilities: () => ({
      ...CATALOG_CAPABILITIES,
      canPublish: false,
    }),
    async validateConnection(ctx) {
      const catalogId =
        typeof ctx.connection.config.catalogId === "string" ? ctx.connection.config.catalogId.trim() : "";
      if (!catalogId) {
        return { ok: false, error: "Select a Meta product catalog before linking WhatsApp." };
      }

      const token = metaAccessToken(ctx.connection.credentials);
      const catalog = await metaGraphRequest<{ id?: string; name?: string }>(catalogId, {
        accessToken: token,
        search: { fields: "id,name" },
      });

      const wabaId =
        typeof ctx.connection.config.wabaId === "string" ? ctx.connection.config.wabaId.trim() : "";
      if (isWhatsAppBusinessAccountId(wabaId)) {
        const check = await verifyWhatsAppBusinessAccount({
          accessToken: token,
          wabaId,
          catalogId,
        });
        if (check.ok) {
          return { ok: true, displayName: check.name || ctx.connection.displayName || "WhatsApp Business" };
        }
      }

      return {
        ok: true,
        displayName: catalog.name || ctx.connection.displayName || "WhatsApp (Meta catalog)",
      };
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
      return upsertMetaCatalogProduct({ ...product, availability: "out_of_stock" }, ctx, externalProductId);
    },
  };
}
