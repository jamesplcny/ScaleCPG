"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ClientSignupPage() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!invite) {
      setError("Missing invitation. Please use the link provided by your manufacturer.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/client/dashboard&invite=${invite}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email to confirm your account.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg-primary px-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="font-semibold text-lg tracking-tight text-text-muted hover:text-text-primary transition-colors no-underline">
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
            Client Portal &mdash; Create your account
          </p>
        </div>

        {!invite ? (
          <div className="bg-bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-sm text-text-secondary mb-4">
              You need an invitation link from your manufacturer to create an account.
            </p>
            <Link href="/client/login" className="text-sm text-accent-rose hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose"
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
                className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-rose"
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
              <Link href="/client/login" className="text-accent-rose hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
