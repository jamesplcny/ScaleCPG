"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ManufacturerApplyPage() {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [moq, setMoq] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();

    // Sign up with company info in metadata
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "manufacturer_user",
          company_name: companyName.trim(),
          location: location.trim(),
          moq: moq.trim(),
          company_description: description.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If session returned immediately (email confirm OFF), provision and redirect.
    // Insert user_roles first, then profile (profile RLS requires role to exist).
    if (data.session && data.user) {
      await supabase
        .from("user_roles")
        .upsert({ user_id: data.user.id, role: "manufacturer_user" as const }, { onConflict: "user_id" });

      // Small delay to ensure user_roles is committed before profile insert checks RLS
      await new Promise((r) => setTimeout(r, 500));

      // Create pending manufacturer profile
      const { error: profileError } = await supabase
        .from("manufacturer_profiles")
        .upsert({
          user_id: data.user.id,
          company_name: companyName.trim(),
          company_description: description.trim(),
          location: location.trim(),
          moq: moq.trim(),
        }, { onConflict: "user_id" });

      if (profileError) {
        console.error("Profile creation error:", profileError.message);
      }

      window.location.href = "/dashboard";
      return;
    }

    // Email confirmation required
    setMessage("Check your email to confirm your account. After confirmation, you can sign in to view your application status.");
    setLoading(false);
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose";

  return (
    <div className="min-h-screen bg-bg-primary px-4">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="font-semibold text-lg tracking-tight text-text-muted hover:text-text-primary transition-colors no-underline"
        >
          ScaleCPG
        </Link>
      </div>
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-semibold text-2xl tracking-tight text-text-primary">
              ScaleCPG
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Apply as a manufacturer partner. We&apos;ll review your application and get back to you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            {error && (
              <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-accent-sage bg-accent-sage/10 border border-accent-sage/20 rounded-lg px-4 py-2.5">
                {message}
              </div>
            )}

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Luxe Labs Manufacturing"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
                placeholder="e.g. Los Angeles, CA"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Minimum Order Quantity
              </label>
              <input
                type="text"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                className={inputClass}
                placeholder="e.g. 500 units"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Company Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Tell us about your manufacturing capabilities..."
              />
            </div>

            <hr className="border-border" />

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                placeholder="Min 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all font-sans disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>

            <p className="text-center text-[13px] text-text-muted pt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-accent-rose hover:underline no-underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
