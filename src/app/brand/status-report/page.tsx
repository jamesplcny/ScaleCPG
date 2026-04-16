import { requireBrandUser } from "@/lib/auth";

export default async function BrandStatusReportPage() {
  await requireBrandUser();

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Status Report</h1>
      <p className="text-sm text-[#6B7280] mt-1">Track the status of your orders.</p>
      <div className="mt-10 bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
        <p className="text-[#9CA3AF] text-sm">No items to report.</p>
      </div>
    </div>
  );
}
