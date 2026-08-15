import { formatSupabaseAuthError } from "@/lib/supabase/errors";

export function isWebAuthnAvailable() {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}

function authErrorCode(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return err.code;
  }
  return null;
}

export function formatPasskeyError(err: unknown): string {
  const code = authErrorCode(err);

  if (code === "passkey_disabled") {
    return "Passkeys are not enabled on this Supabase project. Open Authentication → Passkeys in the dashboard and turn them on.";
  }
  if (code === "too_many_passkeys") {
    return "This account already has the maximum number of passkeys.";
  }
  if (code === "webauthn_credential_exists") {
    return "This device already has a passkey for this account.";
  }
  if (code === "webauthn_credential_not_found") {
    return "That passkey is not registered on this account.";
  }
  if (code === "webauthn_challenge_expired" || code === "webauthn_challenge_not_found") {
    return "The passkey prompt expired. Try again.";
  }
  if (code === "webauthn_verification_failed") {
    return "That passkey could not be verified. Try another device or security key.";
  }

  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "AbortError") {
      return "Passkey prompt was cancelled.";
    }
    if (err.name === "InvalidStateError") {
      return "This device already has a passkey for this account.";
    }
    if (err.name === "NotSupportedError") {
      return "This browser does not support passkeys.";
    }
  }

  return formatSupabaseAuthError(err);
}
