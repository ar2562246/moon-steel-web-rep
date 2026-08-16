import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { listPublicConnections, upsertConnection } from "@/features/catalog-sync/connections/store";
import { registerCatalogSyncProviders, describeVisiblePlatforms, isMockSyncEnabled } from "@/features/catalog-sync/core/register";
import { MOCK_PROVIDER_ID } from "@/features/catalog-sync/providers/mock/provider";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  registerCatalogSyncProviders();
  const connections = await listPublicConnections(auth.ctx.admin);
  return NextResponse.json({
    platforms: describeVisiblePlatforms(connections),
    connections,
    mockEnabled: isMockSyncEnabled(),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as { provider?: string; scenario?: string };
  if (body.provider !== MOCK_PROVIDER_ID || !isMockSyncEnabled()) {
    return NextResponse.json({ error: "Only the development mock can be connected this way." }, { status: 400 });
  }
  registerCatalogSyncProviders();
  const connection = await upsertConnection(auth.ctx.admin, {
    provider: MOCK_PROVIDER_ID,
    displayName: "Development mock catalog",
    status: "connected",
    config: { scenario: body.scenario === "failure" || body.scenario === "rate_limit" || body.scenario === "token_expired" ? body.scenario : "success" },
    credentials: { kind: "mock" },
    connectedBy: auth.ctx.userId,
  });
  return NextResponse.json({ connection });
}

