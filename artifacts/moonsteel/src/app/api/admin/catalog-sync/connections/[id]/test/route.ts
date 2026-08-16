import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getConnectionRecord, updateConnectionConfig } from "@/features/catalog-sync/connections/store";
import { registerCatalogSyncProviders } from "@/features/catalog-sync/core/register";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const connection = await getConnectionRecord(auth.ctx.admin, id);
  if (!connection) return NextResponse.json({ error: "Connection not found." }, { status: 404 });

  const provider = registerCatalogSyncProviders().get(connection.provider);
  if (!provider) return NextResponse.json({ error: "Unknown provider." }, { status: 400 });

  const platformId = provider.platforms[0]?.id;
  if (!platformId) return NextResponse.json({ error: "Provider has no platforms." }, { status: 400 });

  try {
    const result = await provider.validateConnection({ connection, platformId });
    await updateConnectionConfig(auth.ctx.admin, id, {
      status: result.ok ? "connected" : "error",
      lastError: result.ok ? null : result.error || "Connection test failed.",
      displayName: result.displayName,
    });
    return NextResponse.json({ ok: result.ok, displayName: result.displayName, error: result.error ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed.";
    await updateConnectionConfig(auth.ctx.admin, id, { status: "error", lastError: message });
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
