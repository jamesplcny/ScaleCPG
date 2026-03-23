"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Mail, User, ExternalLink, Tag, ShoppingBag } from "lucide-react";
import { saveBrandProfileAction } from "./actions";
import { SalesChannelsSelect } from "@/components/brand/SalesChannelsSelect";
import { CategoriesTagsInput } from "@/components/brand/CategoriesTagsInput";

interface BrandProfileFormProps {
  initial: {
    name: string;
    website: string;
    description: string;
    primary_contact_name: string;
    sales_channels: string[];
    product_categories: string[];
  };
  email: string;
}

export function BrandProfileForm({ initial, email }: BrandProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name,
    website: initial.website,
    description: initial.description,
    primary_contact_name: initial.primary_contact_name,
    sales_channels: initial.sales_channels,
    product_categories: initial.product_categories,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setSaved(false);
    const result = await saveBrandProfileAction(form);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSaved(true);
    setLoading(false);
    router.refresh();
  }

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
          <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Brand Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Glow Beauty Co."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="e.g. https://glowbeauty.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Tell manufacturers about your brand..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Primary Contact Name</label>
            <input
              type="text"
              value={form.primary_contact_name}
              onChange={(e) => update("primary_contact_name", e.target.value)}
              placeholder="e.g. Jane Smith"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Email</label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={labelClass}>Sales Channels</label>
            <SalesChannelsSelect
              value={form.sales_channels}
              onChange={(channels) => update("sales_channels", channels)}
            />
          </div>

          <div>
            <label className={labelClass}>Product Categories</label>
            <CategoriesTagsInput
              value={form.product_categories}
              onChange={(categories) => update("product_categories", categories)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white border-none rounded-lg font-sans text-sm font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-accent-sage font-medium">Saved</span>
          )}
        </div>
      </section>

      {/* Right — Live Preview */}
      <section className="bg-bg-card border border-border rounded-[16px] p-6 lg:sticky lg:top-6">
        <h3 className="font-semibold text-xl mb-5">Preview</h3>

        <div className="space-y-4">
          {/* Brand Name */}
          <div>
            <h4 className="font-serif font-semibold text-2xl text-text-primary">
              {form.name || "Brand Name"}
            </h4>
          </div>

          {/* Website */}
          {form.website && (
            <div className="flex items-center gap-1.5 text-sm text-accent-rose">
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="font-mono text-[12px]">{form.website}</span>
            </div>
          )}

          {/* Description */}
          {form.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {form.description}
            </p>
          )}

          {/* Contact Info */}
          {(form.primary_contact_name || email) && (
            <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
              {form.primary_contact_name && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <User className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                  <span>{form.primary_contact_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Mail className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                <span>{email}</span>
              </div>
            </div>
          )}

          {/* Sales Channels */}
          {form.sales_channels.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Sales Channels</h5>
              <div className="flex flex-wrap gap-2">
                {form.sales_channels.map((channel) => (
                  <span key={channel} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-rose/10 rounded-md text-[12px] font-medium text-accent-rose">
                    <ShoppingBag className="w-3 h-3" strokeWidth={2} />
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Categories */}
          {form.product_categories.length > 0 && (
            <div className="pt-3 border-t border-border">
              <h5 className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Product Categories</h5>
              <div className="flex flex-wrap gap-2">
                {form.product_categories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-teal/10 rounded-md text-[12px] font-medium text-accent-teal">
                    <Tag className="w-3 h-3" strokeWidth={2} />
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!form.name && !form.description && form.sales_channels.length === 0 && form.product_categories.length === 0 && (
            <p className="text-sm text-text-muted italic">Start filling in the form to see a live preview.</p>
          )}
        </div>
      </section>
    </div>
  );
}
