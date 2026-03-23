import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PackagingVaultSection } from "../VaultSection";
import type { PackagingVaultItem } from "@/types/database";

export default async function PackagingVaultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: packagingData } = await supabase
    .from("packaging_vault_items")
    .select("*")
    .order("name") as { data: PackagingVaultItem[] | null; error: unknown };

  const packagingItems = (packagingData ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    packaging_type: p.packaging_type,
    description: p.description,
  }));

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
        <h2 className="font-semibold text-2xl text-text-primary">Packaging Vault</h2>
        <p className="text-sm text-text-secondary mt-1">Manage packaging options available for your products.</p>
      </div>

      <PackagingVaultSection packagingItems={packagingItems} />
    </>
  );
}
