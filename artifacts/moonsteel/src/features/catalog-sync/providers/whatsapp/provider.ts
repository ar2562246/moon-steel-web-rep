import { CATALOG_CAPABILITIES, type ProviderContext, type SocialProvider } from "../../core/types";
import { commonCatalogIssues } from "../../core/validate-product";
import { metaAccessToken } from "../meta/graph";
import { deleteMetaCatalogProduct, upsertMetaCatalogProduct } from "../meta/catalog";
import { requireWhatsAppAccount, verifyWhatsAppBusinessAccount } from "./account";

export const WHATSAPP_PROVIDER_ID = "whatsapp";

async function assertLinkedWhatsApp(ctx: ProviderContext) {
  requireWhatsAppAccount(
    await verifyWhatsAppBusinessAccount({
      accessToken: metaAccessToken(ctx.connection.credentials),
      wabaId: typeof ctx.connection.config.wabaId === "string" ? ctx.connection.config.wabaId : "",
      catalogId: typeof ctx.connection.config.catalogId === "string" ? ctx.connection.config.catalogId : "",
    })
  );
}

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
      const check = await verifyWhatsAppBusinessAccount({
        accessToken: metaAccessToken(ctx.connection.credentials),
        wabaId: typeof ctx.connection.config.wabaId === "string" ? ctx.connection.config.wabaId : "",
        catalogId: typeof ctx.connection.config.catalogId === "string" ? ctx.connection.config.catalogId : "",
      });
      if (!check.ok) return { ok: false, error: check.error };
      return { ok: true, displayName: check.name || ctx.connection.displayName || "WhatsApp Business" };
    },
    async validateProduct(product) {
      const issues = commonCatalogIssues(product, { requirePrice: true, requireHttpsImage: true });
      return { ok: issues.length === 0, issues };
    },
    async createProduct(product, ctx) {
      await assertLinkedWhatsApp(ctx);
      return upsertMetaCatalogProduct(product, ctx);
    },
    async updateProduct(product, ctx, externalProductId) {
      await assertLinkedWhatsApp(ctx);
      return upsertMetaCatalogProduct(product, ctx, externalProductId);
    },
    async deleteProduct(product, ctx) {
      await assertLinkedWhatsApp(ctx);
      return deleteMetaCatalogProduct(product, ctx);
    },
    async unpublishProduct(product, ctx, externalProductId) {
      await assertLinkedWhatsApp(ctx);
      return upsertMetaCatalogProduct({ ...product, availability: "out_of_stock" }, ctx, externalProductId);
    },
  };
}
