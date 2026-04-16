import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function BrandDashboardPage() {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
        Welcome{brand?.name ? `, ${brand.name}` : ""}
      </h1>
      <div className="mt-10 bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
        <p className="text-[#9CA3AF] text-sm">Your dashboard will appear here.</p>
      </div>
    </div>
  );
}
