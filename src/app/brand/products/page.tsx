import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ApprovedProduct } from "@/types/database";
import { CurrentProductsList } from "./CurrentProductsList";

export default async function BrandMyProductsPage() {
  const { brandId } = await requireBrandUser();
  const supabase = await createClient();

  // Fetch approved products for this brand
  const { data: rawApproved } = await supabase
    .from("approved_products")
    .select("*")
    .eq("brand_id", brandId);

  const approvedProducts = (rawApproved ?? []) as ApprovedProduct[];

  // Resolve manufacturer names
  const mfgIds = [...new Set(approvedProducts.map((p) => p.manufacturer_id))];

  let mfgMap = new Map<string, string>();
  if (mfgIds.length > 0) {
    const { data: mfgData } = await supabase
      .from("manufacturer_profiles")
      .select("id, company_name")
      .in("id", mfgIds);
    mfgMap = new Map(
      (mfgData ?? []).map((m) => [(m as { id: string }).id, (m as { company_name: string }).company_name])
    );
  }

  // Current Products: approved_products with status = 'current'
  const serializedCurrentProducts = approvedProducts
    .filter((p) => p.status === "current")
    .map((p) => ({
      id: p.id,
      manufacturer_id: p.manufacturer_id,
      manufacturer_name: mfgMap.get(p.manufacturer_id) ?? "Manufacturer",
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
        <h2 className="font-semibold text-2xl text-text-primary">
          My Products
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Products across all your manufacturers.
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
