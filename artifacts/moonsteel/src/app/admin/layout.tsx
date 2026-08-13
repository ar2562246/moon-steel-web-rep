import { AdminScrollLock } from "@/features/admin/components/AdminScrollLock";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-background">
      <AdminScrollLock />
      {children}
    </div>
  );
}
