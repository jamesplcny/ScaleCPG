import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AccessoryVaultSection } from "../VaultSection";
import type { AccessoryVaultItem } from "@/types/database";

export default async function AccessoryVaultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accessoryData } = await supabase
    .from("accessory_vault_items")
    .select("*")
    .order("name") as { data: AccessoryVaultItem[] | null; error: unknown };

  const accessoryItems = (accessoryData ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
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
        <h2 className="font-semibold text-2xl text-text-primary">Accessory Vault</h2>
        <p className="text-sm text-text-secondary mt-1">Manage accessories like dropper caps, pumps, and dispensers.</p>
      </div>

      <AccessoryVaultSection accessoryItems={accessoryItems} />
    </>
  );
}
