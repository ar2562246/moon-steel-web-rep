"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { formatSupabaseAuthError } from "@/lib/supabase/errors";
import { useAuth } from "@/providers/AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfileRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/admin";
  const resetSuccess = searchParams.get("reset") === "success";
  const authError = searchParams.get("error") === "auth";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setIsSubmitting(true);

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

      if (data.user?.id && data.user.email) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            role: "user",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }

      const role = await refreshProfileRole(data.user?.id ?? null);
      if (role !== "admin" && redirectTo.startsWith("/admin")) {
        router.replace("/unauthorized");
        return;
      }

      router.replace(redirectTo);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-md rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your admin credentials.
        </p>

        {resetSuccess ? (
          <p className="mt-4 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-foreground">
            Password updated. Sign in with your new password.
          </p>
        ) : null}

        {authError ? (
          <p className="mt-4 text-sm text-destructive">
            Reset link expired or invalid.{" "}
            <Link href="/login/forgot-password" className="underline">
              Request a new link
            </Link>
            .
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
