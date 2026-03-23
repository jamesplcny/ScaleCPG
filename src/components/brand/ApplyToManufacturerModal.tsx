"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

interface ApplyToManufacturerModalProps {
  open: boolean;
  onClose: () => void;
  manufacturerName: string;
  manufacturerId: string;
  brandId: string;
}

export function ApplyToManufacturerModal({
  open,
  onClose,
  manufacturerName,
  manufacturerId,
  brandId,
}: ApplyToManufacturerModalProps) {
  const [tellUs, setTellUs] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [alreadySelling, setAlreadySelling] = useState(false);
  const [sellingDetails, setSellingDetails] = useState("");
  const [packaging, setPackaging] = useState("");
  const [expectedQty, setExpectedQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setTellUs("");
    setLookingFor("");
    setAlreadySelling(false);
    setSellingDetails("");
    setPackaging("");
    setExpectedQty("");
    setError("");
    setSuccess(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("brand_manufacturer_applications")
      .insert({
        brand_id: brandId,
        manufacturer_id: manufacturerId,
        created_by_user_id: user.id,
        tell_us_about_yourself: tellUs.trim(),
        what_are_you_looking_for: lookingFor.trim(),
        already_selling: alreadySelling,
        selling_details: alreadySelling ? sellingDetails.trim() || null : null,
        packaging_preference: packaging.trim(),
        expected_order_quantity: expectedQty.trim(),
      });

    if (insertError) {
      if (insertError.message.includes("duplicate") || insertError.message.includes("unique")) {
        setError("You have already applied to this manufacturer.");
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm font-sans text-text-primary outline-none transition-colors focus:border-accent-rose";
  const labelClass =
    "block text-[11px] text-text-muted uppercase tracking-wider mb-2";

  if (success) {
    return (
      <Modal open={open} onClose={handleClose} title="Application Submitted" maxWidth="max-w-md">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-accent-sage/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary mb-1">
            Your application to <span className="font-medium text-text-primary">{manufacturerName}</span> has been submitted.
          </p>
          <p className="text-xs text-text-muted">They&apos;ll review it and get back to you.</p>
        </div>
        <button
          onClick={handleClose}
          className="w-full mt-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all font-sans"
        >
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Apply to ${manufacturerName}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Tell us about yourself *</label>
          <textarea
            value={tellUs}
            onChange={(e) => setTellUs(e.target.value)}
            required
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Brief intro about your brand, mission, and stage..."
          />
        </div>

        <div>
          <label className={labelClass}>What are you looking for? *</label>
          <textarea
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            required
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="What products or services do you need from this manufacturer?"
          />
        </div>

        <div>
          <label className={labelClass}>Are you already selling?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAlreadySelling(true)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-sans border cursor-pointer transition-all ${
                alreadySelling
                  ? "bg-accent-rose/[0.06] border-accent-rose text-accent-rose font-medium"
                  : "bg-transparent border-border text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => { setAlreadySelling(false); setSellingDetails(""); }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-sans border cursor-pointer transition-all ${
                !alreadySelling
                  ? "bg-accent-rose/[0.06] border-accent-rose text-accent-rose font-medium"
                  : "bg-transparent border-border text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {alreadySelling && (
          <div>
            <label className={labelClass}>Selling details</label>
            <textarea
              value={sellingDetails}
              onChange={(e) => setSellingDetails(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Where are you currently selling? Estimated monthly volume?"
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Packaging preference *</label>
          <textarea
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            required
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Do you have specific packaging, or do you want in-house packaging options?"
          />
        </div>

        <div>
          <label className={labelClass}>Expected order quantity *</label>
          <textarea
            value={expectedQty}
            onChange={(e) => setExpectedQty(e.target.value)}
            required
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="First order size and expected future order volumes..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm font-sans text-text-secondary cursor-pointer transition-all hover:bg-bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
