import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { deleteConnection, getConnectionRecord, updateConnectionConfig } from "@/features/catalog-sync/connections/store";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string;
    config?: Record<string, unknown>;
    status?: "connected" | "disconnected" | "expired" | "error";
  };

  const current = await getConnectionRecord(auth.ctx.admin, id);
  if (!current) return NextResponse.json({ error: "Connection not found." }, { status: 404 });

  const config =
    body.config && typeof body.config === "object"
      ? { ...current.config, ...body.config }
      : current.config;

  await updateConnectionConfig(auth.ctx.admin, id, {
    displayName: body.displayName,
    status: body.status,
    config,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  await deleteConnection(auth.ctx.admin, id);
  return NextResponse.json({ ok: true });
}
