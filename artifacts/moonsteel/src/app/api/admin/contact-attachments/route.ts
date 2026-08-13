import { NextResponse } from "next/server";
import { CONTACT_ATTACHMENT_BUCKET, isContactAttachmentPath } from "@/lib/contact/attachments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireAdminApi() {
  if (!hasSupabaseServerEnv()) {
    return { error: NextResponse.json({ error: "Not configured." }, { status: 503 }) };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ error: "Storage is not configured." }, { status: 503 }) };
  }

  return { admin };
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!isContactAttachmentPath(path)) {
    return NextResponse.json({ error: "Invalid attachment path." }, { status: 400 });
  }

  const { data, error } = await auth.admin.storage
    .from(CONTACT_ATTACHMENT_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not create a download link." }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const paths = Array.isArray((body as { paths?: unknown }).paths)
    ? (body as { paths: unknown[] }).paths.filter(
        (path): path is string => typeof path === "string" && isContactAttachmentPath(path)
      )
    : [];

  if (paths.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await auth.admin.storage.from(CONTACT_ATTACHMENT_BUCKET).remove(paths);
  if (error) {
    return NextResponse.json({ error: "Could not delete attachments." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
