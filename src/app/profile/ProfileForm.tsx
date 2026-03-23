"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Package, BadgeCheck, Globe, EyeOff } from "lucide-react";

const CAPABILITY_OPTIONS = [
  "Skincare",
  "Haircare",
  "Body Care",
  "Sun Care",
  "Color Cosmetics",
  "Fragrance",
  "OTC / Drug",
  "Organic / Natural",
  "Vegan / Cruelty-Free",
  "Private Label",
  "Custom Formulation",
  "Packaging Design",
] as const;
import { saveProfileAction, setProfileVisibilityAction } from "./actions";

interface ProfileFormProps {
  initial: {
    company_name: string;
    company_description: string;
    location: string;
    years_in_business: number;
    capabilities: string[];
    moq: string;
    lead_time: string;
    verified: boolean;
    public_slug: string;
    profile_visibility: string;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: initial.company_name,
    company_description: initial.company_description,
    location: initial.location,
    years_in_business: initial.years_in_business,
    capabilities: initial.capabilities,
    moq: initial.moq,
    lead_time: initial.lead_time,
    public_slug: initial.public_slug,
  });
  const verified = initial.verified;
  const [visibility, setVisibility] = useState(initial.profile_visibility);
  const [pubLoading, setPubLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function toggleCapability(cap: string) {
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.includes(cap)
        ? f.capabilities.filter((c) => c !== cap)
        : [...f.capabilities, cap],
    }));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setSaved(false);
    const result = await saveProfileAction(form);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  async function handleToggleVisibility() {
    const next = visibility === "public" ? "draft" : "public";
    setPubLoading(true);
    const result = await setProfileVisibilityAction(next);
    if (!result.error) setVisibility(next);
    setPubLoading(false);
    router.refresh();
  }

  const isPublic = visibility === "public";

  const inputClass =
    "w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm font-sans text-text-primary outline-none transition-colors focus:border-accent-rose";
  const labelClass =
    "block text-[11px] text-text-muted uppercase tracking-wider mb-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left — Form */}
      <section className="bg-bg-card border border-border rounded-[16px] p-6">
        <h3 className="font-semibold text-xl mb-5">Edit Profile</h3>

        {error && (
          <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5 mb-4">{error}</div>
        )}

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="e.g. ScaleCPG Manufacturing" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Profile URL Slug</label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2.5 bg-bg-secondary border border-r-0 border-border rounded-l-lg text-sm text-text-muted font-sans">/manufacturer/</span>
              <input type="text" value={form.public_slug} onChange={(e) => update("public_slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="your-company" className={`${inputClass} rounded-l-none`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Los Angeles, CA" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Years in Business</label>
              <input type="number" min="0" value={form.years_in_business || ""} onChange={(e) => update("years_in_business", parseInt(e.target.value) || 0)} placeholder="e.g. 12" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.company_description} onChange={(e) => update("company_description", e.target.value)} placeholder="Describe your manufacturing capabilities..." rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Capabilities</label>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITY_OPTIONS.map((cap) => {
                const checked = form.capabilities.includes(cap);
                return (
                  <label
                    key={cap}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-[13px] font-sans ${
                      checked
                        ? "border-accent-rose bg-accent-rose/[0.06] text-accent-rose font-medium"
                        : "border-border bg-transparent text-text-secondary hover:border-border hover:bg-bg-secondary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCapability(cap)}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "border-accent-rose bg-accent-rose" : "border-border bg-transparent"}`}>
                      {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {cap}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Minimum Order Qty</label>
              <input type="text" value={form.moq} onChange={(e) => update("moq", e.target.value)} placeholder="e.g. 5,000 units" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lead Time</label>
              <input type="text" value={form.lead_time} onChange={(e) => update("lead_time", e.target.value)} placeholder="e.g. 4-6 weeks" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg font-sans text-sm font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-accent-sage font-medium">Saved</span>}
        </div>
      </section>

      {/* Right — Live Preview */}
      <section className="bg-bg-card border border-border rounded-[16px] p-6 lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xl">Preview</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${isPublic ? "bg-accent-sage/12 text-accent-sage" : "bg-bg-secondary text-text-muted"}`}>
              {isPublic ? <Globe className="w-3 h-3" strokeWidth={2} /> : <EyeOff className="w-3 h-3" strokeWidth={2} />}
              {isPublic ? "Public" : "Draft"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-sage/12 text-accent-sage text-[12px] font-medium rounded-md">
                <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2} />
                Verified
              </span>
            )}
            <button
              onClick={handleToggleVisibility}
              disabled={pubLoading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed border ${
                isPublic
                  ? "bg-transparent border-border text-text-secondary hover:border-accent-rose hover:text-accent-rose hover:bg-accent-rose/[0.06]"
                  : "bg-accent-sage/12 border-accent-sage/20 text-accent-sage hover:bg-accent-sage/20"
              }`}
            >
              {pubLoading ? "..." : isPublic ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-serif font-semibold text-2xl text-text-primary">
              {form.company_name || "Company Name"}
            </h4>
            {form.location && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-text-secondary">
                <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                {form.location}
              </div>
            )}
            {form.years_in_business > 0 && (
              <p className="text-[12px] text-text-muted mt-1">
                {form.years_in_business} {form.years_in_business === 1 ? "year" : "years"} in business
              </p>
            )}
          </div>

          {isPublic && form.public_slug && (
            <p className="text-[12px] text-accent-rose font-mono">/manufacturer/{form.public_slug}</p>
          )}

          {form.company_description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {form.company_description}
            </p>
          )}

          {form.capabilities.length > 0 && (
            <div>
              <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Capabilities</h5>
              <div className="flex flex-wrap gap-2">
                {form.capabilities.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-bg-secondary rounded-md text-[12px] font-medium text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(form.moq || form.lead_time) && (
            <div className="flex gap-4 pt-3 border-t border-border">
              {form.moq && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Package className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                  <span><span className="font-medium text-text-primary">MOQ:</span> {form.moq}</span>
                </div>
              )}
              {form.lead_time && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Clock className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                  <span><span className="font-medium text-text-primary">Lead:</span> {form.lead_time}</span>
                </div>
              )}
            </div>
          )}

          {!form.company_name && !form.company_description && form.capabilities.length === 0 && (
            <p className="text-sm text-text-muted italic">Start filling in the form to see a live preview.</p>
          )}
        </div>
      </section>
    </div>
  );
}
