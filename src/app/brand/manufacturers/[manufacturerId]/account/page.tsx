import { notFound } from "next/navigation";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { ShoppingBag, ClipboardList, LayoutGrid, PlusCircle, Package, BarChart3 } from "lucide-react";

export default async function ManufacturerAccountPage({
  params,
}: {
  params: Promise<{ manufacturerId: string }>;
}) {
  const { manufacturerId } = await params;
  const { brandId } = await requireBrandUser();

  const supabase = await createClient();

  // Verify this manufacturer exists and the brand has an accepted relationship
  const { data: mfgProfile } = await supabase
    .from("manufacturer_profiles")
    .select("id, company_name")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfgProfile) notFound();

  const mfg = mfgProfile as { id: string; company_name: string };

  // Check for accepted application
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id, status")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  const CARDS = [
    {
      title: "Status Report",
      description: "View accepted items awaiting shipping details.",
      href: `/brand/manufacturers/${manufacturerId}/status-report`,
      icon: BarChart3,
      iconColor: "#F59E0B",
      iconBg: "rgba(245,158,11,0.1)",
      accentFrom: "#F59E0B",
      accentTo: "#FEF3C7",
    },
    {
      title: "Shipments",
      description: "Manage shipments and pickup scheduling with this manufacturer.",
      href: `/brand/manufacturers/${manufacturerId}/shipments`,
      icon: Package,
      iconColor: "#0EA5E9",
      iconBg: "rgba(14,165,233,0.1)",
      accentFrom: "#0EA5E9",
      accentTo: "#BAE6FD",
    },
    {
      title: "Purchase Orders",
      description: "Create and track purchase orders for your products.",
      href: `/brand/manufacturers/${manufacturerId}/purchase-orders`,
      icon: ClipboardList,
      iconColor: "#10B981",
      iconBg: "rgba(16,185,129,0.1)",
      accentFrom: "#10B981",
      accentTo: "#D1FAE5",
    },
    {
      title: "My Products",
      description: "View your approved products from this manufacturer.",
      href: `/brand/manufacturers/${manufacturerId}/products`,
      icon: ShoppingBag,
      iconColor: "#4F46E5",
      iconBg: "rgba(79,70,229,0.1)",
      accentFrom: "#4F46E5",
      accentTo: "#C7D2FE",
    },
    {
      title: "View Product Catalog [ODM]",
      description: "Browse products and request samples or modifications.",
      href: `/brand/manufacturers/${manufacturerId}/catalog`,
      icon: LayoutGrid,
      iconColor: "#8B5CF6",
      iconBg: "rgba(139,92,246,0.1)",
      accentFrom: "#8B5CF6",
      accentTo: "#DDD6FE",
    },
    {
      title: "Create a Product [OEM]",
      description: "Submit a custom product request to this manufacturer.",
      href: `/brand/manufacturers/${manufacturerId}/catalog?tab=oem`,
      icon: PlusCircle,
      iconColor: "#EC4899",
      iconBg: "rgba(236,72,153,0.1)",
      accentFrom: "#EC4899",
      accentTo: "#FBCFE8",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">
          {mfg.company_name} Account
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage your relationship with {mfg.company_name}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        {CARDS.map((card, i) => (
          <DashboardCard key={card.title} {...card} index={i} />
        ))}
      </div>
    </>
  );
}
