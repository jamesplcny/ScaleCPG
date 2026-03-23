import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Star, Package, Gem } from "lucide-react";
import type { PopularVaultItem, PackagingVaultItem, AccessoryVaultItem } from "@/types/database";

export default async function VaultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch counts for each vault section
  const [catalogRes, packagingRes, accessoryRes] = await Promise.all([
    supabase.from("popular_vault_items").select("id", { count: "exact", head: true }),
    supabase.from("packaging_vault_items").select("id", { count: "exact", head: true }),
    supabase.from("accessory_vault_items").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      title: "Product Catalog",
      description: "Manage your catalog items that brands can browse and request quotes for.",
      href: "/products/catalog",
      icon: <Star className="w-6 h-6 text-accent-plum" strokeWidth={1.5} />,
      count: catalogRes.count ?? 0,
      accentClass: "accent-plum",
    },
    {
      title: "Packaging Vault",
      description: "Manage packaging options available for your products.",
      href: "/products/packaging",
      icon: <Package className="w-6 h-6 text-accent-gold" strokeWidth={1.5} />,
      count: packagingRes.count ?? 0,
      accentClass: "accent-gold",
    },
    {
      title: "Accessory Vault",
      description: "Manage accessories like dropper caps, pumps, and dispensers.",
      href: "/products/accessories",
      icon: <Gem className="w-6 h-6 text-accent-teal" strokeWidth={1.5} />,
      count: accessoryRes.count ?? 0,
      accentClass: "accent-teal",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="font-semibold text-2xl text-text-primary">Vault</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your product catalog, packaging, and accessories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-bg-card border border-border rounded-xl p-6 no-underline opacity-0 animate-fade-in-up transition-all hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            style={{ animationDelay: `${0.05 + i * 0.06}s` }}
          >
            <div className="flex items-center gap-3 mb-3">
              {card.icon}
              <h3 className="font-semibold text-lg text-text-primary">{card.title}</h3>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed mb-4">{card.description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-[12px] font-medium text-${card.accentClass}`}>{card.count} {card.count === 1 ? "item" : "items"}</span>
              <span className="text-[12px] text-text-muted group-hover:text-text-secondary transition-colors">View &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
