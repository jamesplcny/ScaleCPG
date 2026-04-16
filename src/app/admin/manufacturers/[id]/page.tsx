import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteForm } from "./InviteForm";
import { ManufacturerConfigForm } from "./ManufacturerConfigForm";

export default async function AdminManufacturerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: mfg } = await supabase
    .from("admin_manufacturers")
    .select("id, company_name, status, config, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!mfg) notFound();

  const { data: invitations } = await supabase
    .from("admin_manufacturer_invitations")
    .select("id, email, status, accepted_at, created_at")
    .eq("admin_manufacturer_id", id)
    .order("created_at", { ascending: false });

  // Load actual team members from manufacturer_users (canonical source).
  // We use the admin client to look up emails from auth.users by user_id.
  const { data: memberRows } = await supabase
    .from("manufacturer_users")
    .select("id, user_id, role, created_at")
    .eq("admin_manufacturer_id", id)
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const members = await Promise.all(
    (memberRows ?? []).map(async (row) => {
      const { data: u } = await admin.auth.admin.getUserById(row.user_id);
      return {
        id: row.id,
        email: u.user?.email ?? "(unknown)",
        role: row.role,
        created_at: row.created_at,
      };
    })
  );

  const statusColor =
    mfg.status === "active"
      ? "bg-[#D1FAE5] text-[#10B981]"
      : mfg.status === "onboarding"
      ? "bg-[#FEF3C7] text-[#F59E0B]"
      : "bg-[#F3F4F6] text-[#6B7280]";

  return (
    <div>
      <Link
        href="/admin/manufacturers"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111111] transition-colors no-underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manufacturers
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
            {mfg.company_name}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Created {new Date(mfg.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
          {mfg.status}
        </span>
      </div>

      {/* Manufacturer Team */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#111111] mb-4">
          {mfg.company_name}&rsquo;s Team
        </h2>
        <InviteForm
          adminManufacturerId={id}
          invitations={invitations ?? []}
          members={members}
        />
      </section>

      {/* Chat Agent Configuration */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#111111]">Chat Agent Configuration</h2>
          <Link
            href={`/admin/manufacturers/${mfg.id}/test-chat`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg no-underline transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Test Chat Agent
          </Link>
        </div>
        <ManufacturerConfigForm
          manufacturerId={mfg.id}
          companyName={mfg.company_name}
          config={(mfg.config ?? {}) as Record<string, unknown>}
        />
      </section>
    </div>
  );
}
