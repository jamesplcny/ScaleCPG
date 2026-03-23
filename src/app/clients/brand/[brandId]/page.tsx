import { notFound } from "next/navigation";
import Link from "next/link";
import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { Package, ClipboardList, ArrowLeft, Truck } from "lucide-react";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const { user } = await requireManufacturerUser();

  const supabase = await createClient();

  // Get manufacturer profile
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) notFound();

  const manufacturerId = (profile as { id: string }).id;

  // Verify accepted application exists for this brand
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id, status")
    .eq("manufacturer_id", manufacturerId)
    .eq("brand_id", brandId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Get brand name
  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();

  const brandName = (brand as { name: string } | null)?.name ?? "Brand";

  return (
    <>
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Clients
        </Link>
        <h2 className="font-semibold text-2xl text-text-primary">
          {brandName} Profile
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage your relationship with {brandName}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <DashboardCard
          title="SKUs"
          description={`View current products for ${brandName}.`}
          href={`/clients/brand/${brandId}/skus`}
          icon={Package}
          iconColor="#10B981"
          iconBg="rgba(16,185,129,0.1)"
          accentFrom="#10B981"
          accentTo="#D1FAE5"
          index={0}
        />
        <DashboardCard
          title="Purchase Orders"
          description={`View purchase orders from ${brandName}.`}
          href={`/clients/brand/${brandId}/purchase-orders`}
          icon={ClipboardList}
          iconColor="#8B5CF6"
          iconBg="rgba(139,92,246,0.1)"
          accentFrom="#8B5CF6"
          accentTo="#DDD6FE"
          index={1}
        />
        <DashboardCard
          title="Shipments"
          description={`Manage shipments from ${brandName}.`}
          href={`/clients/brand/${brandId}/shipments`}
          icon={Truck}
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.1)"
          accentFrom="#F59E0B"
          accentTo="#FEF3C7"
          index={2}
        />
      </div>
    </>
  );
}
