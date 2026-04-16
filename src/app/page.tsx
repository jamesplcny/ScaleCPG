import { CheckCircle2 } from "lucide-react";
import { GetStartedButton } from "@/components/GetStartedButton";
import { HeroFlow } from "@/components/landing/HeroFlow";
import { ValueProps } from "@/components/landing/ValueProps";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { MeetAgents } from "@/components/landing/MeetAgents";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

const inter = "font-[family-name:var(--font-inter)]";

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#111111] ${inter}`}>
      <LandingNav />

      {/* ── Hero ── */}
      <section className="max-w-[1120px] mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left — copy */}
          <div className="text-left">
            <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold tracking-[-0.01em] text-[#6B7280] mb-3">
              Turn inbound inquiries into qualified orders.
            </p>
            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-[#111111]">
              Stop Losing Leads
            </h1>
            <p className="mt-6 text-[18px] leading-[1.7] text-[#6B7280]">
              ScaleCPG replaces fragmented onboarding with a structured workflow that qualifies leads instantly and accelerates deal flow.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 text-[14px] text-[#6B7280]">
              {["AI-powered lead capture", "Pricing Engine", "Two-way production visibility"].map(
                (point) => (
                  <span key={point} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" strokeWidth={2} />
                    {point}
                  </span>
                )
              )}
            </div>

            <div className="mt-9">
              <GetStartedButton className="inline-flex items-center px-6 py-3 bg-[#111111] text-white text-[15px] font-medium rounded-xl transition-colors hover:bg-[#000000] cursor-pointer">
                Book a Call
              </GetStartedButton>
            </div>
          </div>

          {/* Right — ScaleCPG pipeline */}
          <HeroFlow />
        </div>
      </section>

      {/* ── Value Props ── */}
      <ValueProps />

      {/* ── Platform Showcase ── */}
      <LandingShowcase />

      {/* ── Meet the Agents ── */}
      <MeetAgents />

      {/* ── How It Works ── */}
      <HowItWorks />

      <LandingFooter />
    </div>
  );
}
