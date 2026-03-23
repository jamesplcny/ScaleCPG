import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCatalogSection } from "../VaultSection";
import type { PopularVaultItem, PackagingVaultItem, AccessoryVaultItem } from "@/types/database";

export default async function ProductCatalogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: catalogData } = await supabase
    .from("popular_vault_items")
    .select("*")
    .order("created_at", { ascending: false }) as { data: PopularVaultItem[] | null; error: unknown };

  const { data: packagingData } = await supabase
    .from("packaging_vault_items")
    .select("*")
    .order("name") as { data: PackagingVaultItem[] | null; error: unknown };

  const { data: accessoryData } = await supabase
    .from("accessory_vault_items")
    .select("*")
    .order("name") as { data: AccessoryVaultItem[] | null; error: unknown };

  const packagingAll = packagingData ?? [];
  const accessoryAll = accessoryData ?? [];

  const pkgMap = new Map(packagingAll.map((p) => [p.id, p.name]));
  const accMap = new Map(accessoryAll.map((a) => [a.id, a.name]));

  const catalogItems = (catalogData ?? []).map((item) => ({
    id: item.id,
    item_name: item.item_name,
    ingredient_list: item.ingredient_list,
    selling_points: item.selling_points ?? [],
    packaging_ids: item.packaging_ids ?? [],
    accessory_ids: item.accessory_ids ?? [],
    packaging_names: (item.packaging_ids ?? []).map((pid: string) => pkgMap.get(pid)).filter(Boolean) as string[],
    accessory_names: (item.accessory_ids ?? []).map((aid: string) => accMap.get(aid)).filter(Boolean) as string[],
    how_to_use: item.how_to_use ?? "",
    moq: item.moq,
    created_at: item.created_at,
  }));

  const packagingOptions = packagingAll.map((p) => ({ id: p.id, name: p.name }));
  const accessoryOptions = accessoryAll.map((a) => ({ id: a.id, name: a.name }));

  return (
    <>
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted no-underline hover:text-text-secondary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to Vault
        </Link>
        <h2 className="font-semibold text-2xl text-text-primary">Product Catalog</h2>
        <p className="text-sm text-text-secondary mt-1">Manage catalog items that brands can browse and request quotes for.</p>
      </div>

      <ProductCatalogSection items={catalogItems} packagingOptions={packagingOptions} accessoryOptions={accessoryOptions} />
    </>
  );
}
