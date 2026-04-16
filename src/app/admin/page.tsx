import Link from "next/link";
import { Building2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("admin_manufacturers")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
        Admin Dashboard
      </h1>
      <p className="text-sm text-[#6B7280] mt-1">Manage your ScaleCPG platform.</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-5 max-w-xl">
        <Link
          href="/admin/manufacturers"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow no-underline"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <p className="font-semibold text-[#111111]">Manufacturers</p>
          <p className="text-sm text-[#6B7280] mt-1">{count ?? 0} onboarded</p>
        </Link>
      </div>
    </div>
  );
}
