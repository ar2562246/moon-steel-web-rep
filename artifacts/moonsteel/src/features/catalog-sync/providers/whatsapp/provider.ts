import { CATALOG_CAPABILITIES, type SocialProvider } from "../../core/types";
import { commonCatalogIssues } from "../../core/validate-product";
import { SyncError, SYNC_ERROR_CODES } from "../../core/errors";
import { metaAccessToken, metaGraphRequest } from "../meta/graph";
import { deleteMetaCatalogProduct, upsertMetaCatalogProduct } from "../meta/catalog";

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
        description: "Meta Commerce catalog linked to a WhatsApp Business Account.",
      },
    ],
    capabilities: () => ({
      ...CATALOG_CAPABILITIES,
      canPublish: false,
    }),
    async validateConnection(ctx) {
      const wabaId = ctx.connection.config.wabaId;
      const catalogId = ctx.connection.config.catalogId;
      if (typeof wabaId !== "string" || !wabaId) {
        throw new SyncError("Select a WhatsApp Business Account before syncing.", {
          code: SYNC_ERROR_CODES.VALIDATION,
        });
      }
      if (typeof catalogId !== "string" || !catalogId) {
        throw new SyncError("Link a Meta catalog to the WhatsApp Business Account before syncing.", {
          code: SYNC_ERROR_CODES.VALIDATION,
        });
      }
      const token = metaAccessToken(ctx.connection.credentials);
      const catalogs = await metaGraphRequest<{ data?: Array<{ id: string }> }>(`${wabaId}/product_catalogs`, {
        accessToken: token,
      });
      const linked = (catalogs.data ?? []).some((item) => item.id === catalogId);
      if (!linked) {
        return {
          ok: false,
          error: "The selected catalog is not linked to this WhatsApp Business Account.",
        };
      }
      return { ok: true, displayName: ctx.connection.displayName || "WhatsApp Business" };
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
