import { requireManufacturerUser } from "@/lib/auth";

export default async function ClientsPage() {
  await requireManufacturerUser();

  return (
    <div className="font-[family-name:var(--font-inter)]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Clients</h1>
      <p className="text-sm text-[#6B7280] mt-1">Manage your client relationships.</p>
      <div className="mt-10 bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
        <p className="text-[#9CA3AF] text-sm">No clients yet.</p>
      </div>
    </div>
  );
}
