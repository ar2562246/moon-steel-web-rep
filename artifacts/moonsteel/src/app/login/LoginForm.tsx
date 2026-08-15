"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { authenticatorRequiresMfa, verifyTotpCode } from "@/lib/auth/mfa";
import { formatPasskeyError, isWebAuthnAvailable } from "@/lib/auth/passkeys";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { formatSupabaseAuthError } from "@/lib/supabase/errors";
import { useAuth } from "@/providers/AuthProvider";

type Step = "credentials" | "mfa";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfileRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<Step>(searchParams.get("mfa") === "1" ? "mfa" : "credentials");
  const [pending, setPending] = useState<"password" | "mfa" | "passkey" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/admin";
  const resetSuccess = searchParams.get("reset") === "success";
  const authError = searchParams.get("error") === "auth";

  useEffect(() => {
    setPasskeyAvailable(isWebAuthnAvailable());
  }, []);

  const finishSignIn = async (userId: string | undefined, userEmail: string | undefined) => {
    const supabase = createSupabaseBrowserClient();

    if (userId && userEmail) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email: userEmail,
          role: "user",
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }

    if (await authenticatorRequiresMfa(supabase)) {
      setStep("mfa");
      setTotpCode("");
      return false;
    }

    const role = await refreshProfileRole(userId ?? null);
    if (role !== "admin" && redirectTo.startsWith("/admin")) {
      router.replace("/unauthorized");
      return true;
    }

    router.replace(redirectTo);
    return true;
  };

  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    let cancelled = false;
    const needsMfaRedirect = searchParams.get("mfa") === "1";

    void (async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;

      if (await authenticatorRequiresMfa(supabase)) {
        setStep("mfa");
        return;
      }

      if (!needsMfaRedirect) return;

      const role = await refreshProfileRole(session.user.id);
      if (cancelled) return;
      if (role !== "admin" && redirectTo.startsWith("/admin")) {
        router.replace("/unauthorized");
        return;
      }
      router.replace(redirectTo);
    })();

    return () => {
      cancelled = true;
    };
  }, [redirectTo, refreshProfileRole, router, searchParams]);

  const onSubmitPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setPending("password");

    try {
      const supabase = createSupabaseBrowserClient();
      let data;
      let signInError;

      try {
        ({ data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));
      } catch (networkErr) {
        setError(formatSupabaseAuthError(networkErr));
        return;
      }

      if (signInError) {
        setError(signInError.message);
        return;
      }

      await finishSignIn(data.user?.id, data.user?.email);
    } finally {
      setPending(null);
    }
  };

  const onSubmitMfa = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setPending("mfa");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: verifyError } = await verifyTotpCode(supabase, totpCode);
      if (verifyError) {
        setError(verifyError);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      await finishSignIn(user?.id, user?.email);
    } catch (err) {
      setError(formatSupabaseAuthError(err));
    } finally {
      setPending(null);
    }
  };

  const onPasskeySignIn = async () => {
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setPending("passkey");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: passkeyError } = await supabase.auth.signInWithPasskey();
      if (passkeyError) {
        setError(formatPasskeyError(passkeyError));
        return;
      }
      await finishSignIn(data.user?.id, data.user?.email);
    } catch (err) {
      setError(formatPasskeyError(err));
    } finally {
      setPending(null);
    }
  };

  const onUseDifferentAccount = async () => {
    if (!hasSupabaseEnv()) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setStep("credentials");
    setTotpCode("");
    setError(null);
    router.replace("/login");
  };

  return (
    <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-md rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "mfa"
            ? "Enter the 6-digit code from your authenticator app."
            : "Sign in with your admin credentials or a passkey."}
        </p>

        {resetSuccess && step === "credentials" ? (
          <p className="mt-4 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground">
            Password updated. Sign in with your new password.
          </p>
        ) : null}

        {authError && step === "credentials" ? (
          <p className="mt-4 text-sm text-destructive">
            Reset link expired or invalid.{" "}
            <Link href="/login/forgot-password" className="underline">
              Request a new link
            </Link>
            .
          </p>
        ) : null}

        {step === "mfa" ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmitMfa(e)}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="totp">
                Authenticator code
              </label>
              <input
                id="totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="layer-1 w-full rounded-md px-3 py-2 text-sm tracking-[0.3em] outline-none ring-0 focus:border-primary"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="submit"
              disabled={pending !== null || totpCode.length !== 6}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending === "mfa" ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              disabled={pending !== null}
              onClick={() => void onUseDifferentAccount()}
              className="inline-flex min-h-10 w-full items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Use a different account
            </button>
          </form>
        ) : (
          <>
            <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmitPassword(e)}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="layer-1 w-full rounded-md px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="layer-1 w-full rounded-md px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <button
                type="submit"
                disabled={pending !== null}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
              >
                {pending === "password" ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {passkeyAvailable ? (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-layer-1 px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={() => void onPasskeySignIn()}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 font-medium text-foreground hover:bg-muted/60 disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4" />
                  {pending === "passkey" ? "Waiting for passkey..." : "Sign in with passkey"}
                </button>
              </>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
