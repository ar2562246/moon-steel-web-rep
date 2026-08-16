import { NextResponse } from "next/server";
import { sessionRequiresMfa } from "@/lib/auth/mfa";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminApiContext = {
  userId: string;
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  admin: SupabaseClient;
};

export async function requireAdminApi(): Promise<
  { ok: true; ctx: AdminApiContext } | { ok: false; response: NextResponse }
> {
  if (!hasSupabaseServerEnv()) {
    return { ok: false, response: NextResponse.json({ error: "Not configured." }, { status: 503 }) };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && sessionRequiresMfa(aal)) {
    return { ok: false, response: NextResponse.json({ error: "MFA required." }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, response: NextResponse.json({ error: "Admin client is not configured." }, { status: 503 }) };
  }

  return { ok: true, ctx: { userId: user.id, user, supabase, admin } };
}
