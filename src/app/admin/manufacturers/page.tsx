import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddManufacturerModal } from "./AddManufacturerModal";

export default async function AdminManufacturersPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: manufacturers } = await supabase
    .from("admin_manufacturers")
    .select("id, company_name, status, created_at")
    .order("created_at", { ascending: false });

  // Get invitation counts per manufacturer
  const { data: invitations } = await supabase
    .from("admin_manufacturer_invitations")
    .select("admin_manufacturer_id");

  const inviteCountMap = new Map<string, number>();
  if (invitations) {
    for (const inv of invitations) {
      inviteCountMap.set(inv.admin_manufacturer_id, (inviteCountMap.get(inv.admin_manufacturer_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            Manufacturers
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Manage onboarded manufacturers and their configurations.
          </p>
        </div>
        <AddManufacturerModal />
      </div>

      {!manufacturers || manufacturers.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <p className="text-[#9CA3AF] text-sm">No manufacturers yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {manufacturers.map((mfg) => {
            const inviteCount = inviteCountMap.get(mfg.id) ?? 0;
            const statusColor =
              mfg.status === "active"
                ? "bg-[#D1FAE5] text-[#10B981]"
                : mfg.status === "onboarding"
                ? "bg-[#FEF3C7] text-[#F59E0B]"
                : "bg-[#F3F4F6] text-[#6B7280]";

            return (
              <Link
                key={mfg.id}
                href={`/admin/manufacturers/${mfg.id}`}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow no-underline"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-[#111111]">{mfg.company_name}</p>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
                    {mfg.status}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  {inviteCount} invitation{inviteCount !== 1 ? "s" : ""} sent
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Created {new Date(mfg.created_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
