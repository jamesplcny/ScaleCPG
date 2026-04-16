"use client";

import { useState } from "react";
import { GetStartedButton } from "@/components/GetStartedButton";
import {
  Phone,
  Database,
  Wrench,
  Monitor,
  Search,
  Hammer,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Phone,
    title: "Connect",
    description:
      "Book a call with us today. We\u2019ll go over your company\u2019s specific needs.",
  },
  {
    number: "02",
    icon: Database,
    title: "Operational Intelligence",
    description:
      "Our system\u2019s efficiency is directly dependent on the information it\u2019s given. We work hand in hand with your team to retrieve usable data and configure our agents to align with your established workflows.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Build",
    description:
      "The end result is a fully customized lead capture system that guides users to make higher quality inquiries and walks them through the full sales cycle on our production portal.",
  },
  {
    number: "04",
    icon: Monitor,
    title: "Install + Dashboard",
    description:
      "We add a customized Scout agent to your current manufacturer website and provide a tailored dashboard located on app.scalecpg.ai.",
  },
  {
    number: "05",
    icon: Search,
    title: "AI Scout",
    description:
      "Scout summarizes each lead and sends them to your customized dashboard.",
  },
  {
    number: "06",
    icon: Hammer,
    title: "AI Forge",
    description:
      "Forge analyzes each lead summary and fills in any necessary gaps in order to generate a quote within minutes.",
  },
  {
    number: "07",
    icon: Zap,
    title: "AI Convert",
    description:
      "Once a quote is sent, the client is invited to create an account on app.scalecpg.ai \u2014 where they have full access to each quote and can request changes. The full sales cycle, from RFQ review to order confirmation, takes place on our two-way production visibility platform. All while Convert guides users along the way.",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const activeStep = STEPS[active];
  const ActiveIcon = activeStep.icon;

  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">
      <div className="relative bg-[#111111] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.20)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative p-6 md:p-8">
          {/* Two-column layout */}
          <div className="grid md:grid-cols-[300px_1fr] min-h-[420px]">
            {/* Left — step nav */}
            <div className="flex flex-col md:border-r md:border-white/[0.06] md:pr-1">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === active;
                return (
                  <button
                    key={step.number}
                    onClick={() => setActive(idx)}
                    className={`w-full flex items-center gap-3.5 px-4 py-4 text-left transition-all duration-200 cursor-pointer rounded-lg border-none ${
                      isActive
                        ? "bg-white/[0.06]"
                        : "bg-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Active bar */}
                    <div
                      className={`w-[3px] self-stretch rounded-full shrink-0 transition-colors duration-200 ${
                        isActive ? "bg-[#818CF8]" : "bg-transparent"
                      }`}
                    />

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isActive
                          ? "bg-[#4F46E5]/20 shadow-[0_0_12px_rgba(79,70,229,0.15)]"
                          : "bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors duration-200 ${
                          isActive ? "text-[#818CF8]" : "text-[#6B7280]"
                        }`}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0">
                      <span
                        className={`text-[10px] font-bold tabular-nums block transition-colors duration-200 ${
                          isActive ? "text-[#818CF8]" : "text-[#6B7280]"
                        }`}
                      >
                        {step.number}
                      </span>
                      <span
                        className={`text-[14px] block truncate transition-colors duration-200 ${
                          isActive
                            ? "font-semibold text-white"
                            : "font-medium text-[#6B7280]"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right — active step detail */}
            <div className="relative flex items-center md:pl-8">
              {/* Watermark number */}
              <div className="absolute top-4 right-4 text-[120px] font-bold text-white/[0.02] leading-none select-none pointer-events-none">
                {activeStep.number}
              </div>

              <div
                key={active}
                className="relative w-full animate-fade-in-up"
                style={{ animationDuration: "300ms" }}
              >
                {/* Step badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4F46E5]/15 mb-5">
                  <ActiveIcon
                    className="w-3.5 h-3.5 text-[#818CF8]"
                    strokeWidth={2.5}
                  />
                  <span className="text-[10px] font-semibold tracking-wider text-[#818CF8]">
                    STEP {activeStep.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold text-white tracking-[-0.02em] leading-tight mb-4">
                  {activeStep.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] leading-[1.75] text-[#9CA3AF] max-w-[480px]">
                  {activeStep.description}
                </p>

                {activeStep.number === "01" && (
                  <div className="mt-5">
                    <GetStartedButton className="inline-flex items-center px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[14px] font-medium rounded-xl transition-colors cursor-pointer">
                      Book a Call
                    </GetStartedButton>
                  </div>
                )}

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 mt-8">
                  {STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActive(idx)}
                      className={`rounded-full transition-all duration-200 cursor-pointer border-none ${
                        idx === active
                          ? "w-6 h-1.5 bg-[#818CF8]"
                          : "w-1.5 h-1.5 bg-white/[0.12] hover:bg-white/[0.20]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
