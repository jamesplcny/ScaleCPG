import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import type { ApprovedProduct } from "@/types/database";
import { CurrentProductsList } from "@/app/brand/products/CurrentProductsList";

export default async function ManufacturerMyProductsPage({
  params,
}: {
  params: Promise<{ manufacturerId: string }>;
}) {
  const { manufacturerId } = await params;
  const { brandId } = await requireBrandUser();

  const supabase = await createClient();

  // Verify manufacturer exists
  const { data: mfgProfile } = await supabase
    .from("manufacturer_profiles")
    .select("id, company_name")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfgProfile) notFound();

  const mfg = mfgProfile as { id: string; company_name: string };

  // Verify accepted relationship
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Fetch approved products for this brand + manufacturer
  const { data: rawApproved } = await supabase
    .from("approved_products")
    .select("*")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId);

  const approvedProducts = (rawApproved ?? []) as ApprovedProduct[];

  // Current Products: approved_products with status = 'current'
  const serializedCurrentProducts = approvedProducts
    .filter((p) => p.status === "current")
    .map((p) => ({
      id: p.id,
      manufacturer_id: p.manufacturer_id,
      manufacturer_name: mfg.company_name,
      item_name: p.item_name,
      ingredient_list: p.ingredient_list,
      packaging: p.packaging,
      accessories: p.accessories,
      price_per_unit: p.price_per_unit,
      status: p.status,
    }));

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/brand/manufacturers/${manufacturerId}/account`}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted no-underline hover:text-text-secondary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to {mfg.company_name}
        </Link>
        <h2 className="font-semibold text-2xl text-text-primary">
          My Products — {mfg.company_name}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Products from {mfg.company_name}.
        </p>
      </div>

      <section>
        <h3 className="font-semibold text-xl text-text-primary mb-4">
          Current Products
        </h3>
        <CurrentProductsList products={serializedCurrentProducts} />
      </section>
    </>
  );
}
