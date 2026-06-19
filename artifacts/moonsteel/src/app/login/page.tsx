import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
