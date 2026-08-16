import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { processSyncJob } from "@/features/catalog-sync/jobs/processor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = request.headers.get("x-sync-job-token");
  if (!token) {
    return NextResponse.json({ error: "Missing job token." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  try {
    const result = await processSyncJob(admin, id, token);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job processing failed." },
      { status: 400 }
    );
  }
}
