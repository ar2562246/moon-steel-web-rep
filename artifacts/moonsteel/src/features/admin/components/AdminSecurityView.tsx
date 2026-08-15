"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Factor, PasskeyListItem } from "@supabase/supabase-js";
import { KeyRound, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminToolbar } from "@/features/admin/components/AdminToolbar";
import { useToast } from "@/hooks/use-toast";
import { authenticatorRequiresMfa } from "@/lib/auth/mfa";
import { formatPasskeyError, isWebAuthnAvailable } from "@/lib/auth/passkeys";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { formatSupabaseAuthError } from "@/lib/supabase/errors";

type TotpEnrollment = {
  factorId: string;
  qr: string;
  secret: string;
};

function formatWhen(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

export function AdminSecurityView() {
  const { toast } = useToast();
  const [totpFactors, setTotpFactors] = useState<Factor[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeysEnabled, setPasskeysEnabled] = useState(true);
  const webAuthnAvailable = isWebAuthnAvailable();

  const load = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      setIsLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    try {
      const [factors, listed] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.passkey.list(),
      ]);

      if (factors.error) {
        setError(factors.error.message);
      } else {
        setTotpFactors(factors.data.totp);
      }

      if (listed.error) {
        const message = formatPasskeyError(listed.error);
        setPasskeys([]);
        setPasskeysEnabled(listed.error.code !== "passkey_disabled");
        if (listed.error.code !== "passkey_disabled") {
          setError(message);
        }
      } else {
        setPasskeys(listed.data ?? []);
        setPasskeysEnabled(true);
      }
    } catch (err) {
      setPasskeys([]);
      setPasskeysEnabled(false);
      setError(formatPasskeyError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startTotpEnrollment = async () => {
    setError(null);
    setBusy("totp-enroll");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator app",
        issuer: "Moon Steel",
      });
      if (enrollError || !data || data.type !== "totp") {
        setError(enrollError?.message ?? "Could not start authenticator setup.");
        return;
      }
      setEnrollment({
        factorId: data.id,
        qr: data.totp.qr_code.startsWith("data:")
          ? data.totp.qr_code
          : `data:image/svg+xml;utf-8,${data.totp.qr_code}`,
        secret: data.totp.secret,
      });
      setVerifyCode("");
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setBusy(null);
    }
  };

  const cancelTotpEnrollment = async () => {
    if (!enrollment) return;
    setBusy("totp-cancel");
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    } finally {
      setEnrollment(null);
      setVerifyCode("");
      setBusy(null);
    }
  };

  const confirmTotpEnrollment = async (e: FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;
    setError(null);
    setBusy("totp-verify");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollment.factorId,
        code: verifyCode.replace(/\s/g, ""),
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      setEnrollment(null);
      setVerifyCode("");
      toast({ title: "Authenticator app enabled", description: "You will be asked for a code at login." });
      await load();
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setBusy(null);
    }
  };

  const removeTotp = async (factorId: string) => {
    setError(null);
    setBusy(`totp-remove-${factorId}`);
    try {
      const supabase = createSupabaseBrowserClient();
      if (await authenticatorRequiresMfa(supabase)) {
        setError("Complete the authenticator challenge first, then try again.");
        return;
      }
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollError) {
        setError(unenrollError.message);
        return;
      }
      toast({ title: "Authenticator app removed" });
      await load();
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setBusy(null);
    }
  };

  const registerPasskey = async () => {
    setError(null);
    setBusy("passkey-add");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: registerError } = await supabase.auth.registerPasskey();
      if (registerError) {
        setError(formatPasskeyError(registerError));
        return;
      }
      toast({ title: "Passkey added", description: "You can now sign in without a password." });
      await load();
    } catch (err) {
      setError(formatPasskeyError(err));
    } finally {
      setBusy(null);
    }
  };

  const removePasskey = async (passkeyId: string) => {
    setError(null);
    setBusy(`passkey-remove-${passkeyId}`);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase.auth.passkey.delete({ passkeyId });
      if (deleteError) {
        setError(formatPasskeyError(deleteError));
        return;
      }
      toast({ title: "Passkey removed" });
      await load();
    } catch (err) {
      setError(formatPasskeyError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <AdminToolbar
        nav={<p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">Login security</p>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Login security</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an authenticator app for 2FA, and a passkey for passwordless sign-in.
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Card className="layer-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authenticator app (2FA)
              </CardTitle>
              <CardDescription>
                After your password, you will enter a 6-digit code from Google Authenticator, 1Password, or a similar
                app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : totpFactors.length > 0 && !enrollment ? (
                <ul className="space-y-3">
                  {totpFactors.map((factor) => (
                    <li
                      key={factor.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{factor.friendly_name || "Authenticator app"}</p>
                        <p className="text-xs text-muted-foreground">Added {formatWhen(factor.created_at)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => void removeTotp(factor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {busy === `totp-remove-${factor.id}` ? "Removing…" : "Remove"}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {enrollment ? (
                <form className="space-y-4" onSubmit={(e) => void confirmTotpEnrollment(e)}>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code in your authenticator app, then enter the 6-digit code it shows.
                  </p>
                  {enrollment.qr ? (
                    <img
                      src={enrollment.qr}
                      alt="Authenticator QR code"
                      className="h-44 w-44 rounded-md bg-white p-2"
                    />
                  ) : null}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Can&apos;t scan? Enter this key instead</p>
                    <code className="block break-all rounded-md bg-muted px-3 py-2 text-xs">{enrollment.secret}</code>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="totp-setup-code">
                      Verification code
                    </label>
                    <input
                      id="totp-setup-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="layer-1 w-full max-w-xs rounded-md px-3 py-2 text-sm tracking-[0.3em] outline-none ring-0 focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={busy !== null || verifyCode.length !== 6}>
                      {busy === "totp-verify" ? "Enabling…" : "Enable 2FA"}
                    </Button>
                    <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void cancelTotpEnrollment()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button type="button" disabled={busy !== null || isLoading} onClick={() => void startTotpEnrollment()}>
                  {busy === "totp-enroll" ? "Starting…" : totpFactors.length > 0 ? "Add another authenticator" : "Set up authenticator app"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="layer-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Passkeys
              </CardTitle>
              <CardDescription>
                Sign in with Face ID, Touch ID, Windows Hello, or a hardware security key instead of a password.
                Register passkeys on the live site. They are bound to moonsteelfab.com and will not work on localhost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!passkeysEnabled ? (
                <p className="text-sm text-muted-foreground">
                  Enable passkeys in the Supabase dashboard under Authentication → Passkeys. Use relying party ID{" "}
                  <code className="text-xs">moonsteelfab.com</code> and origin{" "}
                  <code className="text-xs">https://moonsteelfab.com</code>.
                </p>
              ) : null}

              {!webAuthnAvailable ? (
                <p className="text-sm text-muted-foreground">This browser does not support passkeys.</p>
              ) : null}

              {passkeys.length > 0 ? (
                <ul className="space-y-3">
                  {passkeys.map((passkey) => (
                    <li
                      key={passkey.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{passkey.friendly_name || "Passkey"}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatWhen(passkey.created_at)}
                          {passkey.last_used_at ? ` · Last used ${formatWhen(passkey.last_used_at)}` : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => void removePasskey(passkey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {busy === `passkey-remove-${passkey.id}` ? "Removing…" : "Remove"}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : !isLoading && passkeysEnabled ? (
                <p className="text-sm text-muted-foreground">No passkeys registered yet.</p>
              ) : null}

              <Button
                type="button"
                disabled={busy !== null || isLoading || !webAuthnAvailable || !passkeysEnabled}
                onClick={() => void registerPasskey()}
              >
                {busy === "passkey-add" ? "Waiting for passkey…" : "Add passkey"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
