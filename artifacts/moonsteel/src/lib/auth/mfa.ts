import type { SupabaseClient } from "@supabase/supabase-js";

export function sessionRequiresMfa(aal: {
  currentLevel: string | null;
  nextLevel: string | null;
}): boolean {
  return aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";
}

export async function authenticatorRequiresMfa(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return sessionRequiresMfa(data);
}

export async function verifyTotpCode(
  supabase: SupabaseClient,
  code: string
): Promise<{ error: string | null }> {
  const factors = await supabase.auth.mfa.listFactors();
  if (factors.error) return { error: factors.error.message };

  const totp = factors.data.totp[0];
  if (!totp) return { error: "No authenticator app is set up on this account." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: totp.id,
    code: code.replace(/\s/g, ""),
  });

  return { error: error?.message ?? null };
}
