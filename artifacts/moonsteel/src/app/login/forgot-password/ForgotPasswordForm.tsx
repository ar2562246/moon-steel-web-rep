"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { formatSupabaseAuthError } from "@/lib/supabase/errors";

const inputClassName =
  "layer-1 w-full rounded-md px-3 py-2 text-sm outline-none ring-0 focus:border-primary";

type Step = "email" | "sent" | "code";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async () => {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/login/reset-password`;
    try {
      return await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    } catch (err) {
      return { data: null, error: { message: formatSupabaseAuthError(err), name: "AuthError" } };
    }
  };

  const onSendLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await sendResetEmail();

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setStep("sent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendLink = async () => {
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await sendResetEmail();

      if (resetError) {
        setError(resetError.message);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetWithCode = async (e: FormEvent<HTMLFormElement>) => {
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

      let verifyError;
      try {
        ({ error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: "recovery",
        }));
      } catch (networkErr) {
        setError(formatSupabaseAuthError(networkErr));
        return;
      }

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

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

  return (
    <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-md rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Reset admin password</h1>

        {step === "email" ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your admin email. We will send a secure reset link (Supabase default).
            </p>
            <form className="mt-6 space-y-4" onSubmit={onSendLink}>
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
                  className={inputClassName}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        ) : null}

        {step === "sent" && !showCodeForm ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-3 text-sm text-foreground">
              If an account exists for <strong>{email}</strong>, check your inbox for a password
              reset email.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Open the email from Supabase.</li>
              <li>Click <strong>Reset password</strong> (or the link in the email).</li>
              <li>You will return to this site to choose a new password.</li>
            </ol>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void onResendLink()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Resend email"}
            </button>

            <button
              type="button"
              onClick={() => setShowCodeForm(true)}
              className="inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-primary hover:underline"
            >
              I have a 6-digit code instead
            </button>
          </div>
        ) : null}

        {step === "sent" && showCodeForm ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Only use this if your email includes a numeric code (custom Supabase template).
            </p>
            <form className="mt-6 space-y-4" onSubmit={onResetWithCode}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="email-readonly">
                  Email
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  readOnly
                  value={email}
                  className={`${inputClassName} text-muted-foreground`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground" htmlFor="code">
                  Reset code
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                  className={inputClassName}
                />
              </div>

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
                  className={inputClassName}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60"
              >
                {isSubmitting ? "Updating..." : "Set new password"}
              </button>

              <button
                type="button"
                onClick={() => setShowCodeForm(false)}
                className="inline-flex min-h-11 w-full items-center justify-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to reset link instructions
              </button>
            </form>
          </>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
