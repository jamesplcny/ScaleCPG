"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Eye, ShoppingBag, Tag, UserCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { acceptApplicationAction, rejectApplicationAction } from "./application-actions";

type ApplicationItem = {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_description: string;
  brand_website: string;
  brand_sales_channels: string[];
  brand_product_categories: string[];
  tell_us_about_yourself: string;
  what_are_you_looking_for: string;
  already_selling: boolean;
  selling_details: string | null;
  packaging_preference: string;
  expected_order_quantity: string;
  status: string;
  created_at: string;
};

interface ClientApplicationsListProps {
  applications: ApplicationItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent-gold/10 text-accent-gold",
  accepted: "bg-accent-sage/10 text-accent-sage",
  rejected: "bg-accent-rose/10 text-accent-rose",
};

type ModalStep = "view" | "accept-confirm" | "reject-confirm";

export function ClientApplicationsList({ applications }: ClientApplicationsListProps) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ApplicationItem | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("view");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openModal(app: ApplicationItem) {
    setViewing(app);
    setModalStep("view");
    setRejectionReason("");
    setError("");
  }

  function closeModal() {
    setViewing(null);
    setModalStep("view");
    setRejectionReason("");
    setError("");
  }

  async function handleAcceptConfirm() {
    if (!viewing) return;
    setLoading(true);
    setError("");
    const result = await acceptApplicationAction(viewing.id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    closeModal();
    router.refresh();
  }

  async function handleRejectConfirm() {
    if (!viewing) return;
    setLoading(true);
    setError("");
    const result = await rejectApplicationAction(viewing.id, rejectionReason);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    closeModal();
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm font-sans text-text-primary outline-none transition-colors focus:border-accent-rose resize-none";
  const labelClass =
    "block text-[11px] text-text-muted uppercase tracking-wider mb-2";

  // Split into accepted clients vs pending/rejected applications
  const myClients = applications.filter((a) => a.status === "accepted");
  const pendingApps = applications.filter((a) => a.status !== "accepted");

  return (
    <>
      {/* My Clients section */}
      <section className="mb-10">
        <h3 className="font-semibold text-xl text-text-primary mb-4">My Clients</h3>
        {myClients.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
            <p className="text-text-muted text-sm">No accepted clients yet. Accept an application below to add your first client.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myClients.map((app, i) => (
              <ClientCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Applications section */}
      <section>
        <h3 className="font-semibold text-xl text-text-primary mb-4">Applications</h3>
        {pendingApps.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
            <p className="text-text-muted text-sm">No pending applications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingApps.map((app, i) => {
              const initials = app.brand_name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={app.id}
                  className="group bg-bg-card border border-border rounded-[16px] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-transparent opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-accent-rose to-accent-rose-light" />

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-border bg-bg-secondary flex items-center justify-center shrink-0">
                      <span className="font-serif font-semibold text-base text-text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-text-primary leading-tight">{app.brand_name}</h3>
                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-muted mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {app.brand_website && (
                    <div className="flex items-center gap-1.5 text-[12px] text-accent-rose mb-3">
                      <ExternalLink className="w-3 h-3" strokeWidth={2} />
                      <span className="font-mono">{app.brand_website}</span>
                    </div>
                  )}

                  {app.brand_description && (
                    <p className="text-[13px] text-text-secondary leading-relaxed mb-3 line-clamp-2">{app.brand_description}</p>
                  )}

                  {(app.brand_sales_channels.length > 0 || app.brand_product_categories.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {app.brand_sales_channels.slice(0, 3).map((ch) => (
                        <span key={ch} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-rose/10 text-accent-rose text-[10px] rounded-full">
                          <ShoppingBag className="w-2.5 h-2.5" strokeWidth={2} />{ch}
                        </span>
                      ))}
                      {app.brand_product_categories.slice(0, 3).map((cat) => (
                        <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] rounded-full">
                          <Tag className="w-2.5 h-2.5" strokeWidth={2} />{cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => openModal(app)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-rose cursor-pointer bg-transparent border-none p-0 transition-colors hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                    View Application
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Application Modal — multi-step */}
      {viewing && (
        <Modal
          open={!!viewing}
          onClose={closeModal}
          title={
            modalStep === "accept-confirm"
              ? "Confirm Acceptance"
              : modalStep === "reject-confirm"
              ? "Confirm Rejection"
              : `Application from ${viewing.brand_name}`
          }
          maxWidth="max-w-lg"
        >
          {error && (
            <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          {/* Step 1: View application */}
          {modalStep === "view" && (
            <>
              <div className="space-y-5">
                <div>
                  <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">About the Brand</h5>
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-lg p-3">{viewing.tell_us_about_yourself || "—"}</p>
                </div>
                <div>
                  <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">What They&apos;re Looking For</h5>
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-lg p-3">{viewing.what_are_you_looking_for || "—"}</p>
                </div>
                <div>
                  <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Already Selling?</h5>
                  <p className="text-sm text-text-primary">{viewing.already_selling ? "Yes" : "No"}</p>
                  {viewing.already_selling && viewing.selling_details && (
                    <p className="text-sm text-text-secondary whitespace-pre-wrap bg-bg-secondary rounded-lg p-3 mt-1.5">{viewing.selling_details}</p>
                  )}
                </div>
                <div>
                  <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Packaging Preference</h5>
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-lg p-3">{viewing.packaging_preference || "—"}</p>
                </div>
                <div>
                  <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Expected Order Quantity</h5>
                  <p className="text-sm text-text-primary whitespace-pre-wrap bg-bg-secondary rounded-lg p-3">{viewing.expected_order_quantity || "—"}</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLES[viewing.status] ?? STATUS_STYLES.pending}`}>
                    {viewing.status}
                  </span>
                  <span className="text-xs text-text-muted">Submitted {new Date(viewing.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {viewing.status === "pending" && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm font-sans text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setModalStep("reject-confirm"); setError(""); }}
                    className="flex-1 py-2.5 bg-accent-teal/10 border border-accent-teal/20 rounded-lg text-sm font-sans text-accent-teal font-medium cursor-pointer transition-all hover:bg-accent-teal/20"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { setModalStep("accept-confirm"); setError(""); }}
                    className="flex-1 py-2.5 bg-accent-sage/10 border border-accent-sage/20 rounded-lg text-sm font-sans text-accent-sage font-medium cursor-pointer transition-all hover:bg-accent-sage/20"
                  >
                    Accept
                  </button>
                </div>
              )}

              {viewing.status !== "pending" && (
                <button
                  onClick={closeModal}
                  className="w-full mt-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all font-sans"
                >
                  Close
                </button>
              )}
            </>
          )}

          {/* Step 2a: Accept confirmation */}
          {modalStep === "accept-confirm" && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed bg-bg-secondary rounded-lg p-4">
                By accepting this client, you give them access to your full product catalog and allow them to make order requests.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setModalStep("view"); setError(""); }}
                  className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm font-sans text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-accent-sage text-white border-none rounded-lg text-sm font-sans font-medium cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Accepting..." : "Confirm"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2b: Reject confirmation */}
          {modalStep === "reject-confirm" && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed bg-bg-secondary rounded-lg p-4">
                Please give reasoning. This user will not be able to apply again for another 24 hours.
              </p>

              <div>
                <label className={labelClass}>Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setModalStep("view"); setError(""); }}
                  className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm font-sans text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-accent-teal text-white border-none rounded-lg text-sm font-sans font-medium cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Rejecting..." : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

// Small internal component for accepted client cards
function ClientCard({ app, index }: { app: ApplicationItem; index: number }) {
  const initials = app.brand_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="group bg-bg-card border border-border rounded-[16px] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-transparent opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-accent-sage to-accent-sage" />

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-border bg-bg-secondary flex items-center justify-center shrink-0">
          <span className="font-serif font-semibold text-base text-text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-text-primary leading-tight">{app.brand_name}</h3>
        </div>
      </div>

      {app.brand_description && (
        <p className="text-[13px] text-text-secondary leading-relaxed mb-3 line-clamp-2">{app.brand_description}</p>
      )}

      {(app.brand_sales_channels.length > 0 || app.brand_product_categories.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {app.brand_sales_channels.slice(0, 3).map((ch) => (
            <span key={ch} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-rose/10 text-accent-rose text-[10px] rounded-full">
              <ShoppingBag className="w-2.5 h-2.5" strokeWidth={2} />{ch}
            </span>
          ))}
          {app.brand_product_categories.slice(0, 3).map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-teal/10 text-accent-teal text-[10px] rounded-full">
              <Tag className="w-2.5 h-2.5" strokeWidth={2} />{cat}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/clients/brand/${app.brand_id}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-rose/10 text-accent-rose text-[12px] font-medium rounded-lg border border-accent-rose/20 no-underline transition-all hover:bg-accent-rose/20"
      >
        <UserCircle className="w-3.5 h-3.5" strokeWidth={2} />
        My Account
      </Link>
    </div>
  );
}
