import { requireBrandUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { Mail, Calendar, Pencil, ShoppingBag, Search, BarChart3, Package } from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    title: "Status Report",
    description: "View accepted items awaiting shipping details from your manufacturers.",
    href: "/brand/status-report",
    icon: BarChart3,
    iconColor: "#0EA5E9",
    iconBg: "rgba(14,165,233,0.1)",
    accentFrom: "#0EA5E9",
    accentTo: "#BAE6FD",
  },
  {
    title: "Shipments",
    description: "Manage shipments, pickup scheduling, and delivery tracking.",
    href: "/brand/shipments",
    icon: Package,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    accentFrom: "#F59E0B",
    accentTo: "#FEF3C7",
  },
  {
    title: "My Products",
    description: "View and manage your product catalog, track order statuses, and add new products.",
    href: "/brand/products",
    icon: ShoppingBag,
    iconColor: "#4F46E5",
    iconBg: "rgba(79,70,229,0.1)",
    accentFrom: "#4F46E5",
    accentTo: "#C7D2FE",
  },
  {
    title: "Browse Manufacturers",
    description: "Discover and connect with verified private-label manufacturers for your brand.",
    href: "/brand/manufacturers",
    icon: Search,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    accentFrom: "#10B981",
    accentTo: "#D1FAE5",
  },
];

export default async function BrandDashboard() {
  const { user, brandId } = await requireBrandUser();
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("name, created_at")
    .eq("id", brandId)
    .single();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="font-semibold text-2xl text-text-primary">
          Welcome, {brand?.name ?? "your brand"}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage your brand profile and discover manufacturers.
        </p>
      </div>

      {/* My Profile */}
      <section className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-text-primary">
            My Profile
          </h3>
          <Link
            href="/brand/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg no-underline transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
              Brand Name
            </p>
            <p className="text-sm font-medium text-text-primary">
              {brand?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Owner Email
            </p>
            <p className="text-sm text-text-primary">{user.email}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Created
            </p>
            <p className="text-sm text-text-primary">
              {brand?.created_at
                ? new Date(brand.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        {CARDS.map((card, i) => (
          <DashboardCard key={card.title} {...card} index={i} />
        ))}
      </div>
    </div>
  );
}
