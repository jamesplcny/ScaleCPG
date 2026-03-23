"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BrandSignupPage() {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    // signUp stores brand_name in user_metadata.
    // With "Confirm email" ON, session will be null — user must confirm first.
    // The /auth/callback route reads brand_name from metadata and provisions the brand rows.
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { brand_name: brandName.trim(), role: "brand_user" },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/brand/dashboard`,
      },
    });

    if (authError) {
      // If user already exists, try signing them in and provisioning
      if (authError.message.toLowerCase().includes("already registered")) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError("An account with this email already exists. Please sign in instead.");
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Self-heal: ensure user_roles + brand rows exist
          await supabase
            .from("user_roles")
            .upsert({ user_id: user.id, role: "brand_user" }, { onConflict: "user_id" });

          const { data: existingBrand } = await supabase
            .from("brands")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingBrand) {
            const { data: brand } = await supabase
              .from("brands")
              .insert({ user_id: user.id, name: brandName.trim() })
              .select("id")
              .single();

            if (brand) {
              await supabase.from("brand_users").insert({
                brand_id: brand.id,
                user_id: user.id,
                invited_email: email.trim(),
                role: "owner",
                status: "active",
              });
            }
          }

          window.location.href = "/brand/dashboard";
          return;
        }
      }

      setError(authError.message);
      setLoading(false);
      return;
    }

    // Edge case: if session returned immediately (email confirm OFF),
    // provision client-side using the authenticated anon client, then redirect.
    if (data.session && data.user) {
      await supabase
        .from("user_roles")
        .upsert({ user_id: data.user.id, role: "brand_user" }, { onConflict: "user_id" });

      const { data: brand } = await supabase
        .from("brands")
        .insert({ user_id: data.user.id, name: brandName.trim() })
        .select("id")
        .single();

      if (brand) {
        await supabase.from("brand_users").insert({
          brand_id: brand.id,
          user_id: data.user.id,
          invited_email: email.trim(),
          role: "owner",
          status: "active",
        });
      }

      window.location.href = "/brand/dashboard";
      return;
    }

    // No session — email confirmation required
    router.push(`/brand/confirm-email?email=${encodeURIComponent(email)}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-semibold text-2xl tracking-tight text-text-primary">
              ScaleCPG
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Create your brand account to browse manufacturers and manage orders.
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

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Glow Beauty Co."
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
                Email
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
                Password
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
              {loading ? "Creating account..." : "Create Account"}
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
