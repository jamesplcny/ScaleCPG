"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tab = "brand" | "manufacturer";

const TABS: { key: Tab; label: string }[] = [
  { key: "brand", label: "Brands" },
  { key: "manufacturer", label: "Manufacturers" },
];

const HELPER: Record<Tab, string> = {
  brand: "Sign in to browse manufacturers and manage orders.",
  manufacturer: "Sign in to manage your catalog, clients, and orders.",
};

const SIGNUP_HREF: Record<Tab, string> = {
  brand: "/brand/signup",
  manufacturer: "/signup",
};

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("brand");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Unable to retrieve user.");
      setLoading(false);
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    let role = roleRow?.role;

    // No role row — try to self-heal from user metadata
    if (!role) {
      const rawMeta = (user.user_metadata?.role ?? user.user_metadata?.signup_role) as string | undefined;
      // Normalize legacy "manufacturer_admin" to "manufacturer_user"
      const metaRole = rawMeta === "manufacturer_admin" ? "manufacturer_user" : rawMeta;
      if (metaRole === "brand_user" || metaRole === "manufacturer_user") {
        const { error: upsertError } = await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: metaRole }, { onConflict: "user_id" });

        if (!upsertError) {
          role = metaRole;
        }
      }

      if (!role) {
        await supabase.auth.signOut();
        setError("Account not set up \u2014 please complete signup.");
        setLoading(false);
        return;
      }
    }

    // Check role matches selected tab
    const isBrand = role === "brand_user";
    const isManufacturer = role === "manufacturer_user" || role === "manufacturer_admin";

    if (tab === "brand" && !isBrand) {
      await supabase.auth.signOut();
      setError("No brand account found for this email. Did you mean to sign in as a manufacturer?");
      setLoading(false);
      return;
    }

    if (tab === "manufacturer" && !isManufacturer) {
      await supabase.auth.signOut();
      setError("No manufacturer account found for this email. Did you mean to sign in as a brand?");
      setLoading(false);
      return;
    }

    // Redirect based on role
    if (isBrand) {
      window.location.href = "/brand/dashboard";
    } else {
      window.location.href = "/dashboard";
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
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
            <p className="text-sm text-text-secondary mt-1">{HELPER[tab]}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            {/* Role Tabs */}
            <div className="flex gap-1 bg-bg-secondary rounded-[10px] p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => switchTab(t.key)}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-sans border-none cursor-pointer transition-all duration-200 ${
                    tab === t.key
                      ? "bg-bg-card text-text-primary font-medium shadow-sm"
                      : "bg-transparent text-text-secondary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

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
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#4F46E5] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-[13px] text-text-muted pt-1">
              Don&apos;t have an account?{" "}
              <Link href={SIGNUP_HREF[tab]} className="text-accent-rose hover:underline no-underline font-medium">
                {tab === "manufacturer" ? "Apply here" : "Create one here"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
