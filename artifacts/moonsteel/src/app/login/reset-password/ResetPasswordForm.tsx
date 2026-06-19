"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { formatSupabaseAuthError } from "@/lib/supabase/errors";

const inputClassName =
  "layer-1 w-full rounded-md px-3 py-2 text-sm outline-none ring-0 focus:border-primary";

/** Used when the user opens the reset link from email (auth callback establishes session). */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setIsReady(true);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setError(null);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError("This reset link is invalid or expired. Request a new link from forgot password.");
      }
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let updateError;
      try {
        ({ error: updateError } = await supabase.auth.updateUser({ password }));
      } catch (networkErr) {
        setError(formatSupabaseAuthError(networkErr));
        return;
      }

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?reset=success");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-md rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your admin account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={Boolean(error && error.includes("invalid or expired"))}
              className={inputClassName}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={Boolean(error && error.includes("invalid or expired"))}
              className={inputClassName}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || Boolean(error && error.includes("invalid or expired"))}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login/forgot-password" className="text-primary hover:underline">
            Request a new reset link
          </Link>
          {" · "}
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
