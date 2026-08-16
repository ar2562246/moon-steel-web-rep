import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getCatalogProductById } from "@/features/catalog/queries";
import { normalizeCatalogProductForSync } from "@/features/catalog-sync/core/normalize";
import { registerCatalogSyncProviders } from "@/features/catalog-sync/core/register";
import { getConnectionForPlatform } from "@/features/catalog-sync/connections/store";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as {
    productId?: string;
    platformIds?: string[];
  };
  if (!body.productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }
  const product = await getCatalogProductById(auth.ctx.admin, body.productId);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const registry = registerCatalogSyncProviders();
  const platformIds = Array.isArray(body.platformIds) && body.platformIds.length > 0
    ? body.platformIds
    : registry.platforms().map((platform) => platform.id);

  const normalized = normalizeCatalogProductForSync(product, { siteOrigin: getSiteUrl() });
  const results = [];
  for (const platformId of platformIds) {
    const provider = registry.providerForPlatform(platformId);
    if (!provider) {
      results.push({ platformId, ok: false, issues: [{ field: "platform", message: "Unknown platform.", fatal: true }] });
      continue;
    }
    const connection = await getConnectionForPlatform(auth.ctx.admin, platformId);
    if (!connection) {
      results.push({
        platformId,
        ok: false,
        issues: [{ field: "connection", message: "Platform is not connected.", fatal: true }],
      });
      continue;
    }
    const validation = await provider.validateProduct(normalized, { connection, platformId });
    results.push({ platformId, ok: validation.ok, issues: validation.issues });
  }

  return NextResponse.json({ results });
}
