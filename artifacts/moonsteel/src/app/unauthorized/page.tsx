import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="layer-0 flex min-h-screen items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-lg rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in, but your account does not have admin access.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted/60"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in with another account
          </Link>
        </div>
      </section>
    </main>
  );
}
