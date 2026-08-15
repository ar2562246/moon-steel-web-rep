import { redirect } from "next/navigation";
import { sessionRequiresMfa } from "@/lib/auth/mfa";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";

type RequireAdminResult = {
  userId: string;
};

export async function requireAdmin(
  options: { redirectTo?: string } = {}
): Promise<RequireAdminResult | null> {
  const redirectTo = options.redirectTo ?? "/admin";

  if (!hasSupabaseServerEnv()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && sessionRequiresMfa(aal)) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}&mfa=1`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/unauthorized");
  }

  return { userId: user.id };
}
