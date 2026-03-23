import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Package, BadgeCheck, ArrowLeft, Building2, CalendarDays, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ManufacturerProfile, ManufacturerCapability } from "@/types/database";

export default async function ManufacturerPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("manufacturer_profiles")
    .select("*")
    .eq("public_slug", slug)
    .eq("profile_visibility", "public")
    .maybeSingle() as { data: ManufacturerProfile | null; error: unknown };

  if (!data) notFound();

  const profile = data;

  const { data: capData } = await supabase
    .from("manufacturer_capabilities")
    .select("*")
    .eq("user_id", profile.user_id) as { data: ManufacturerCapability[] | null; error: unknown };

  const capabilities = (capData ?? []).map((c) => c.capability);

  const initials = profile.company_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top nav */}
      <nav className="border-b border-border bg-bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-text-primary no-underline">ScaleCPG</Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors no-underline font-sans">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to Marketplace
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero Card */}
        <div className="bg-bg-card border border-border rounded-[20px] overflow-hidden shadow-sm">
          {/* Gradient accent bar */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #B8965A, #8A9A7B, #8B7291)" }} />

          <div className="p-8 sm:p-10">
            {/* Logo + Name + Badge row */}
            <div className="flex items-start gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bg-secondary to-border flex items-center justify-center shrink-0 shadow-sm">
                <span className="font-semibold text-xl text-text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-semibold text-[28px] text-text-primary leading-tight">{profile.company_name}</h1>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-sage/10 text-accent-sage text-[11px] font-semibold uppercase tracking-wider rounded-full shrink-0">
                      <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {profile.location && (
                    <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                      {profile.location}
                    </div>
                  )}
                  {profile.years_in_business > 0 && (
                    <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                      <CalendarDays className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                      {profile.years_in_business}+ years
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {(profile.moq || profile.lead_time || profile.years_in_business > 0) && (
              <div className="grid grid-cols-3 gap-4 mb-8 max-sm:grid-cols-1">
                {profile.moq && (
                  <div className="bg-bg-secondary/60 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Package className="w-3.5 h-3.5 text-accent-gold" strokeWidth={2} />
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Min. Order</span>
                    </div>
                    <p className="text-[15px] font-semibold text-text-primary">{profile.moq}</p>
                  </div>
                )}
                {profile.lead_time && (
                  <div className="bg-bg-secondary/60 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent-plum" strokeWidth={2} />
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Lead Time</span>
                    </div>
                    <p className="text-[15px] font-semibold text-text-primary">{profile.lead_time}</p>
                  </div>
                )}
                {profile.years_in_business > 0 && (
                  <div className="bg-bg-secondary/60 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Building2 className="w-3.5 h-3.5 text-accent-sage" strokeWidth={2} />
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">Established</span>
                    </div>
                    <p className="text-[15px] font-semibold text-text-primary">{profile.years_in_business} {profile.years_in_business === 1 ? "Year" : "Years"}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {profile.company_description && (
              <div className="mb-8">
                <h3 className="text-[11px] text-text-muted uppercase tracking-widest font-semibold mb-3">About</h3>
                <p className="text-[14px] text-text-secondary leading-[1.7]">{profile.company_description}</p>
              </div>
            )}

            {/* Capabilities */}
            {capabilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[11px] text-text-muted uppercase tracking-widest font-semibold mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-bg-secondary rounded-full text-[12px] font-medium text-text-primary border border-border/50">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
                <p className="text-[13px] text-text-muted max-sm:text-center">Interested in working together? Get in touch to discuss your project.</p>
                <button className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-text-primary text-white rounded-xl font-sans text-sm font-semibold cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0">
                  Request Quote
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
