import { hasSupabaseServerEnv } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { AdminLogoutButton } from "@/features/admin/components/AdminLogoutButton";

export default async function AdminPage() {
  if (!hasSupabaseServerEnv()) {
    return (
      <main className="layer-0 min-h-screen px-4 pb-12 pt-28 md:px-6">
        <section className="layer-1 mx-auto max-w-3xl rounded-xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
          <p className="mt-2 text-sm text-destructive">
            Supabase environment variables are not configured.
          </p>
        </section>
      </main>
    );
  }

  await requireAdmin({ redirectTo: "/admin" });

  return (
    <main className="layer-0 min-h-screen px-4 pb-12 pt-28 md:px-6">
      <section className="layer-1 mx-auto max-w-5xl rounded-xl p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage app content and media modules.</p>
          </div>
          <AdminLogoutButton />
        </div>
        <div className="mt-6">
          <AdminDashboard />
        </div>
      </section>
    </main>
  );
}
