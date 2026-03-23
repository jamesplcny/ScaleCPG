import { createClient } from "@/lib/supabase/server";
import { requireManufacturerUser } from "@/lib/auth";
import { DashboardCard } from "@/components/cards/DashboardCard";
import { Users, LayoutGrid, BookOpen, ClipboardList, BarChart3, Package, Clock, XCircle, Mail, Calendar, MapPin, Pencil } from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    title: "Status Report",
    description: "Track accepted purchase order items and production status.",
    href: "/status-report",
    icon: BarChart3,
    iconColor: "#0EA5E9",
    iconBg: "rgba(14,165,233,0.1)",
    accentFrom: "#0EA5E9",
    accentTo: "#BAE6FD",
  },
  {
    title: "Shipments",
    description: "Manage shipment requests from your clients.",
    href: "/shipments",
    icon: Package,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    accentFrom: "#F59E0B",
    accentTo: "#FEF3C7",
  },
  {
    title: "Clients",
    description: "Manage brand accounts, contracts, formulation specs, and active project timelines.",
    href: "/clients",
    icon: Users,
    iconColor: "#4F46E5",
    iconBg: "rgba(79,70,229,0.1)",
    accentFrom: "#4F46E5",
    accentTo: "#C7D2FE",
  },
  {
    title: "Purchase Orders",
    description: "View and manage purchase orders from your clients.",
    href: "/purchase-orders",
    icon: ClipboardList,
    iconColor: "#8B5CF6",
    iconBg: "rgba(139,92,246,0.1)",
    accentFrom: "#8B5CF6",
    accentTo: "#DDD6FE",
  },
  {
    title: "Vault",
    description: "Browse and manage your full product line across all categories.",
    href: "/products",
    icon: LayoutGrid,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    accentFrom: "#10B981",
    accentTo: "#D1FAE5",
  },
  {
    title: "Formulation Library",
    description: "Upload base formulas with ingredients, packaging options, and add-ons for client customization.",
    href: "/formulations",
    icon: BookOpen,
    iconColor: "#EC4899",
    iconBg: "rgba(236,72,153,0.1)",
    accentFrom: "#EC4899",
    accentTo: "#FBCFE8",
  },
];

export default async function Dashboard() {
  const { user, manufacturerStatus } = await requireManufacturerUser();

  // Pending or no profile yet: show application status screen
  if (manufacturerStatus !== "approved" && manufacturerStatus !== "rejected") {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("manufacturer_profiles")
      .select("company_name, company_description, location, moq, created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-plum/10 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-accent-plum" />
          </div>
          <h2 className="font-semibold text-2xl text-text-primary mb-2">
            Application Pending
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            We&apos;re reviewing your application. You&apos;ll be able to access your dashboard once approved.
          </p>

          {profile && (
            <div className="text-left bg-bg-secondary rounded-xl p-5 space-y-3">
              <h3 className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
                Submitted Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
                <div>
                  <p className="text-text-muted text-xs">Company</p>
                  <p className="text-text-primary font-medium">{profile.company_name || "—"}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Location</p>
                  <p className="text-text-primary">{profile.location || "—"}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">MOQ</p>
                  <p className="text-text-primary">{profile.moq || "—"}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">Applied</p>
                  <p className="text-text-primary">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              {profile.company_description && (
                <div>
                  <p className="text-text-muted text-xs">Description</p>
                  <p className="text-text-primary text-sm">{profile.company_description}</p>
                </div>
              )}
            </div>
          )}

          {!profile && (
            <p className="text-sm text-text-muted">
              No application profile found. Please contact support.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Rejected: show rejection screen
  if (manufacturerStatus === "rejected") {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-teal/10 flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-7 h-7 text-accent-teal" />
          </div>
          <h2 className="font-semibold text-2xl text-text-primary mb-2">
            Application Not Approved
          </h2>
          <p className="text-sm text-text-secondary">
            Unfortunately your application was not approved at this time.
            If you believe this is an error, please contact us at{" "}
            <span className="text-accent-rose">support@scalecpg.com</span>.
          </p>
        </div>
      </div>
    );
  }

  // Approved: fetch profile for summary
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("manufacturer_profiles")
    .select("company_name, location, moq, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-semibold text-2xl text-text-primary">
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Here&apos;s what&apos;s happening across your business today.
        </p>
      </div>

      {/* My Profile */}
      <section className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-text-primary">
            My Profile
          </h3>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-lg no-underline transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-6 max-md:grid-cols-2 max-sm:grid-cols-1">
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
              Company Name
            </p>
            <p className="text-sm font-medium text-text-primary">
              {profile?.company_name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="text-sm text-text-primary">{profile?.location ?? "—"}</p>
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
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        {CARDS.map((card, i) => (
          <DashboardCard key={card.title} {...card} index={i} />
        ))}
      </div>
    </div>
  );
}
