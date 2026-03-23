import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CatalogCards } from "./CatalogTable";
import { ArrowLeft } from "lucide-react";
import type { PopularVaultItem, PackagingVaultItem, AccessoryVaultItem, ApprovedProduct } from "@/types/database";

export default async function ProductCatalogPage({
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
    .select("id, company_name, user_id")
    .eq("id", manufacturerId)
    .maybeSingle();

  if (!mfgProfile) notFound();

  const mfg = mfgProfile as { id: string; company_name: string; user_id: string };

  // Verify accepted relationship
  const { data: rawApp } = await supabase
    .from("brand_manufacturer_applications")
    .select("id")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "accepted")
    .maybeSingle();

  if (!rawApp) notFound();

  // Fetch manufacturer's catalog items
  const { data: catalogData } = await supabase
    .from("popular_vault_items")
    .select("*")
    .eq("user_id", mfg.user_id)
    .order("created_at", { ascending: false }) as { data: PopularVaultItem[] | null; error: unknown };

  // Fetch manufacturer's packaging items for name resolution
  const { data: packagingData } = await supabase
    .from("packaging_vault_items")
    .select("id, name")
    .eq("user_id", mfg.user_id) as { data: Pick<PackagingVaultItem, "id" | "name">[] | null; error: unknown };

  // Fetch manufacturer's accessory items for name resolution
  const { data: accessoryData } = await supabase
    .from("accessory_vault_items")
    .select("id, name")
    .eq("user_id", mfg.user_id) as { data: Pick<AccessoryVaultItem, "id" | "name">[] | null; error: unknown };

  const pkgMap = new Map((packagingData ?? []).map((p) => [p.id, p.name]));
  const accMap = new Map((accessoryData ?? []).map((a) => [a.id, a.name]));

  const items = (catalogData ?? []).map((item) => ({
    id: item.id,
    item_name: item.item_name,
    ingredient_list: item.ingredient_list,
    selling_points: item.selling_points ?? [],
    packaging_names: (item.packaging_ids ?? []).map((pid: string) => pkgMap.get(pid)).filter(Boolean) as string[],
    accessory_names: (item.accessory_ids ?? []).map((aid: string) => accMap.get(aid)).filter(Boolean) as string[],
    moq: item.moq,
  }));

  // Fetch current products (approved products with status 'current')
  const { data: approvedData } = await supabase
    .from("approved_products")
    .select("*")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "current")
    .order("approved_at", { ascending: false });

  const currentProducts = (approvedData ?? []) as ApprovedProduct[];

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
          {mfg.company_name} Product Catalog
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Your products and browseable catalog from {mfg.company_name}.
        </p>
      </div>

      {/* Current Products */}
      <section className="mb-10">
        <h3 className="font-semibold text-xl text-text-primary mb-4">
          Current Products
        </h3>
        {currentProducts.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-text-muted text-sm">No products yet. Browse the catalog below to get a quote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
            {currentProducts.map((product, i) => (
              <div
                key={product.id}
                className="bg-bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.03 + i * 0.04}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-base text-text-primary">{product.item_name}</h4>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-sage/10 text-accent-sage">
                    {product.status}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-[13px] mt-2">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Packaging</span>
                    <span className="text-text-secondary text-[12px]">{product.packaging || "—"}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Price/Unit</span>
                    <span className="text-text-primary font-medium text-[12px]">
                      {product.price_per_unit != null ? `$${Number(product.price_per_unit).toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Browse Products */}
      <section>
        <h3 className="font-semibold text-xl text-text-primary mb-4">
          Browse Products
        </h3>
        <CatalogCards items={items} manufacturerId={manufacturerId} manufacturerName={mfg.company_name} />
      </section>
    </>
  );
}
