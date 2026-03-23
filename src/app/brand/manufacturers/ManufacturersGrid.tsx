"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Package, BadgeCheck, Send, CheckCircle, UserCircle, XCircle } from "lucide-react";
import { ApplyToManufacturerModal } from "@/components/brand/ApplyToManufacturerModal";

type ManufacturerItem = {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string;
  location: string;
  moq: string;
  lead_time: string;
  verified: boolean;
  public_slug: string;
  capabilities: string[];
  applicationStatus: string | null;
  rejectedUntil: string | null;
};

interface ManufacturersGridProps {
  manufacturers: ManufacturerItem[];
  brandId: string;
}

function ManufacturerCard({ mfg, index, action }: { mfg: ManufacturerItem; index: number; action: React.ReactNode }) {
  const initials = mfg.company_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const caps = mfg.capabilities;

  return (
    <div
      className="group bg-bg-card border border-border rounded-[16px] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-transparent opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bg-secondary to-border flex items-center justify-center shrink-0">
          <span className="font-serif font-semibold text-base text-text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg text-text-primary leading-tight">{mfg.company_name}</h3>
            {mfg.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-sage/10 text-accent-sage text-[10px] font-semibold uppercase tracking-wider rounded-full">
                <BadgeCheck className="w-3 h-3" strokeWidth={2.5} />
                Verified
              </span>
            )}
          </div>
          {mfg.location && (
            <div className="flex items-center gap-1.5 mt-1 text-[13px] text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
              {mfg.location}
            </div>
          )}
        </div>
      </div>

      {mfg.company_description && (
        <p className="text-[13px] text-text-secondary leading-relaxed mb-4 line-clamp-2">{mfg.company_description}</p>
      )}

      {caps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {caps.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-bg-secondary rounded-md text-[11px] font-medium text-text-secondary">{tag}</span>
          ))}
          {caps.length > 4 && (
            <span className="px-2.5 py-1 bg-bg-secondary rounded-md text-[11px] font-medium text-text-muted">+{caps.length - 4} more</span>
          )}
        </div>
      )}

      {(mfg.moq || mfg.lead_time) && (
        <div className="flex gap-4 mb-4 text-[12px] text-text-secondary">
          {mfg.moq && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
              <span><span className="font-medium text-text-primary">MOQ:</span> {mfg.moq}</span>
            </div>
          )}
          {mfg.lead_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
              <span><span className="font-medium text-text-primary">Lead:</span> {mfg.lead_time}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end">
        {action}
      </div>
    </div>
  );
}

export function ManufacturersGrid({ manufacturers, brandId }: ManufacturersGridProps) {
  const [applyTarget, setApplyTarget] = useState<ManufacturerItem | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  function handleApplyClose() {
    if (applyTarget) {
      setAppliedIds((prev) => new Set(prev).add(applyTarget.id));
    }
    setApplyTarget(null);
  }

  // Split manufacturers into accepted ("My Manufacturers") vs others
  const myManufacturers = manufacturers.filter((m) => m.applicationStatus === "accepted");
  const viewManufacturers = manufacturers.filter((m) => m.applicationStatus !== "accepted");

  return (
    <>
      {/* My Manufacturers */}
      <section className="mb-10">
        <h3 className="font-semibold text-xl text-text-primary mb-4">My Manufacturers</h3>
        {myManufacturers.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
            <p className="text-text-muted text-sm">No accepted manufacturers yet. Apply to manufacturers below to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myManufacturers.map((mfg, i) => (
              <ManufacturerCard
                key={mfg.id}
                mfg={mfg}
                index={i}
                action={
                  <Link
                    href={`/brand/manufacturers/${mfg.id}/account`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-rose/10 text-accent-rose text-[12px] font-medium rounded-lg border border-accent-rose/20 no-underline transition-all hover:bg-accent-rose/20"
                  >
                    <UserCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    My Account
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* View Manufacturers */}
      <section>
        <h3 className="font-semibold text-xl text-text-primary mb-4">View Manufacturers</h3>
        {viewManufacturers.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
            <p className="text-text-muted text-sm">No other manufacturers available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {viewManufacturers.map((mfg, i) => {
              const hasApplied = (mfg.applicationStatus === "pending") || appliedIds.has(mfg.id);
              const isRejected = mfg.applicationStatus === "rejected";
              const cooldownActive = isRejected && mfg.rejectedUntil && new Date(mfg.rejectedUntil) > new Date();

              let actionButton: React.ReactNode;

              if (hasApplied) {
                actionButton = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-sage/10 text-accent-sage text-[12px] font-medium rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    Applied
                  </span>
                );
              } else if (cooldownActive) {
                actionButton = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-rose/10 text-accent-rose text-[12px] font-medium rounded-lg">
                    <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    Apply again in 24h
                  </span>
                );
              } else {
                // Available to apply (including re-apply after cooldown expired)
                actionButton = (
                  <button
                    onClick={() => setApplyTarget(mfg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-rose/10 text-accent-rose text-[12px] font-medium rounded-lg border border-accent-rose/20 cursor-pointer transition-all hover:bg-accent-rose/20"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                    Apply
                  </button>
                );
              }

              return (
                <ManufacturerCard key={mfg.id} mfg={mfg} index={i} action={actionButton} />
              );
            })}
          </div>
        )}
      </section>

      {applyTarget && (
        <ApplyToManufacturerModal
          open={!!applyTarget}
          onClose={handleApplyClose}
          manufacturerName={applyTarget.company_name}
          manufacturerId={applyTarget.id}
          brandId={brandId}
        />
      )}
    </>
  );
}
