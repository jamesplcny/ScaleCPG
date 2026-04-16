"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

async function routeByRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "/login";
    return;
  }
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = roleRow?.role;
  if (role === "super_admin") window.location.href = "/admin";
  else if (role === "brand_user") window.location.href = "/brand/dashboard";
  else if (role === "manufacturer_user" || role === "manufacturer_admin")
    window.location.href = "/dashboard";
  else {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }
}

function SetPasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Your invite link has expired. Please request a new one.");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    await routeByRole();
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-bg-card border border-border rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
        <h2 className="text-lg font-semibold text-text-primary">Set your password</h2>
        <p className="text-sm text-text-secondary mt-1 mb-5">
          Choose a password to finish accepting your invite.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className={inputClass}
              placeholder="Re-enter password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Setting password..." : "Set Password & Continue"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-text-muted hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("set_password") === "1") {
      setShowSetPassword(true);
      // Clean the URL so a refresh doesn't re-trigger the modal
      const url = new URL(window.location.href);
      url.searchParams.delete("set_password");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

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

    const role = roleRow?.role;

    if (!role) {
      await supabase.auth.signOut();
      setError("No account found. Please contact your administrator for access.");
      setLoading(false);
      return;
    }

    if (role === "super_admin") {
      window.location.href = "/admin";
    } else if (role === "brand_user") {
      window.location.href = "/brand/dashboard";
    } else if (role === "manufacturer_user" || role === "manufacturer_admin") {
      window.location.href = "/dashboard";
    } else {
      await supabase.auth.signOut();
      setError("No account found. Please contact your administrator for access.");
      setLoading(false);
      return;
    }
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
            <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
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
          </form>
        </div>
      </div>
      {showSetPassword && <SetPasswordModal onClose={() => setShowSetPassword(false)} />}
    </div>
  );
}
