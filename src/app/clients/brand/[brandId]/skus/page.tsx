import { notFound } from "next/navigation";
import Link from "next/link";
import { requireManufacturerUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import type { ApprovedProduct } from "@/types/database";

export default async function ClientSKUsPage({
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
    .select("id")
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

  // Fetch current/active products for this brand-manufacturer pair
  const { data: rawProducts } = await supabase
    .from("approved_products")
    .select("*")
    .eq("brand_id", brandId)
    .eq("manufacturer_id", manufacturerId)
    .eq("status", "current")
    .order("created_at", { ascending: false });

  const products = (rawProducts ?? []) as ApprovedProduct[];

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/clients/brand/${brandId}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to {brandName}
        </Link>
        <h2 className="font-semibold text-2xl text-text-primary">
          {brandName} — SKUs
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Current products for {brandName}.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-text-muted text-sm">No current SKUs for this brand yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="bg-bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.03 + i * 0.04}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-base text-text-primary">
                  {product.item_name}
                </h4>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent-sage/10 text-accent-sage">
                  active
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-5">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Packaging</span>
                    <span className="text-text-secondary text-[12px]">{product.packaging || "—"}</span>
                  </div>
                  {product.accessories && (
                    <div>
                      <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Accessories</span>
                      <span className="text-text-secondary text-[12px]">{product.accessories}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-text-muted text-[10px] uppercase tracking-wider block mb-0.5">Price/Unit</span>
                    <span className="text-text-primary font-medium text-[12px]">
                      {product.price_per_unit != null ? `$${Number(product.price_per_unit).toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
