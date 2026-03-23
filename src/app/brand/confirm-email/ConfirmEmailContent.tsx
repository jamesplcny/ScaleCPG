"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ConfirmEmailContent({ email }: { email: string }) {
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    setError("");
    setResent(false);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/brand/dashboard`,
      },
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg-primary px-4">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="font-semibold text-lg uppercase text-text-muted hover:text-text-primary transition-colors no-underline"
        >
          ScaleCPG
        </Link>
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="bg-bg-card border border-border rounded-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h2 className="font-semibold text-xl text-text-primary">
              Check your email
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              We sent a confirmation link to{" "}
              {email ? (
                <span className="font-medium text-text-primary">{email}</span>
              ) : (
                "your email"
              )}
              . Click the link to activate your account.
            </p>

            {error && (
              <div className="text-sm text-accent-teal bg-accent-teal/10 border border-accent-teal/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            {resent && (
              <div className="text-sm text-accent-sage bg-accent-sage/10 border border-accent-sage/20 rounded-lg px-4 py-2.5">
                Confirmation email resent.
              </div>
            )}

            {email && (
              <button
                onClick={handleResend}
                disabled={loading}
                className="w-full py-2.5 bg-bg-secondary border border-border rounded-lg text-sm font-medium text-text-primary cursor-pointer transition-all hover:bg-border font-sans disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Resend confirmation email"}
              </button>
            )}

            <p className="text-[13px] text-text-muted pt-2">
              <Link href="/login" className="text-accent-rose hover:underline no-underline font-medium">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
