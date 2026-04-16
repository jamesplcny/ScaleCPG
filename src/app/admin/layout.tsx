import { requireSuperAdmin } from "@/lib/auth";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="flex min-h-screen font-[family-name:var(--font-inter)]">
      <AdminSidebar />
      <main className="flex-1 ml-[240px] p-8 max-lg:ml-0 max-lg:p-5">
        {children}
      </main>
    </div>
  );
}
