import Link from "next/link";

export default function NotFound() {
  return (
    <main className="layer-0 flex min-h-[60vh] items-center justify-center px-4 pb-12 pt-28">
      <section className="layer-1 w-full max-w-lg rounded-xl p-6 text-center md:p-8">
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
