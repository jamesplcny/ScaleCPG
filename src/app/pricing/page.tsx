import Link from "next/link";
import { PricingSection } from "./PricingSection";

const inter = "font-[family-name:var(--font-inter)]";

export default function PricingPage() {
  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#111111] ${inter}`}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-lg border-b border-[#E5E7EB]">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center gap-8">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[-0.01em] text-[#111111] no-underline"
          >
            ScaleCPG
          </Link>
          <Link href="/pricing" className="text-[14px] text-[#111111] font-medium no-underline">
            Pricing
          </Link>
          <Link href="/login" className="text-[14px] text-[#6B7280] hover:text-[#111111] transition-colors no-underline">
            app.scalecpg
          </Link>
        </div>
      </nav>

      {/* ── Header ── */}
      <section className="max-w-[1120px] mx-auto px-6 pt-20 pb-6 md:pt-28 md:pb-8">
        <div className="text-center">
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-[#111111]">
            We fit your needs
          </h1>
        </div>
      </section>

      {/* ── Pricing Cards + Feature Comparison ── */}
      <PricingSection />

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E7EB] mt-20">
        <div className="max-w-[1120px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-semibold text-[#111111] tracking-[-0.01em]">
            ScaleCPG
          </span>
          <p className="text-[13px] text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} ScaleCPG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
