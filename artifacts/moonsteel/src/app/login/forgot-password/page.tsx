import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
