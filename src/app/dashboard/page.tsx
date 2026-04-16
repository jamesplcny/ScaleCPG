import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { user } = await requireManufacturerUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
        Welcome back{profile?.company_name ? `, ${profile.company_name}` : ""}
      </h1>
      <p className="text-sm text-[#6B7280] mt-1">Home</p>
      <div className="mt-10 bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
        <p className="text-[#9CA3AF] text-sm">Your dashboard will appear here.</p>
      </div>
    </div>
  );
}
