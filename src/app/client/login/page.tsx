"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ClientLoginPage() {
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

    window.location.href = "/client/dashboard";
  }

  return (
    <div className="min-h-screen bg-bg-primary px-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="font-semibold text-lg uppercase text-text-muted hover:text-text-primary transition-colors no-underline">
          ScaleCPG
        </Link>
      </div>
      <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-semibold text-[32px] uppercase text-text-primary">
            ScaleCPG
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Client Portal &mdash; Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/20 rounded-lg px-4 py-2.5">
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
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-gold"
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
              className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted font-sans outline-none transition-colors focus:border-accent-gold"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-text-primary border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:opacity-90 font-sans disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-[13px] text-text-muted pt-1">
            Don&apos;t have an account?{" "}
            <span className="text-text-secondary">
              Contact your manufacturer for an invitation link.
            </span>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
