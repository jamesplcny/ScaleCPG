"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

// ── Plan Data ────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    monthly: { price: 399, activation: 250 },
    annual: { price: 299, activation: 250, discount: "25% off" },
    cta: "Get Started",
    ctaHref: "/login",
    highlighted: false,
    features: [
      "Inbound Sales Agent",
      "Never miss a potential customer",
      "Custom dashboard to handle inbound requests",
      "Summarized sales leads sent to email & dashboard",
    ],
  },
  {
    name: "Growth",
    monthly: { price: 999, activation: 500 },
    annual: { price: 699, activation: 500, discount: "30% off" },
    cta: "Get Started",
    ctaHref: "/login",
    highlighted: true,
    badge: "Recommended",
    includesLabel: "Everything in Starter, plus:",
    features: [
      "Send accurate quotes without lifting a finger",
      "Prices adjust automatically when cost of goods change",
      "CRM system with two-way visibility + live tracking",
      "AI handles client check-ins so your team doesn't have to",
    ],
  },
  {
    name: "Custom Enterprise",
    monthly: null,
    annual: null,
    cta: "Contact Us",
    ctaHref: "/login",
    highlighted: false,
    includesLabel: "Everything in Growth, plus:",
    features: [
      "Custom integrations",
      "Dedicated support",
      "Tailored onboarding",
    ],
  },
];

const COMPARISON_FEATURES = [
  { name: "Inbound Sales Agent", starter: true, pro: true, enterprise: true },
  { name: "Basic configurations", starter: true, pro: true, enterprise: true },
  { name: "Custom inbound dashboard", starter: true, pro: true, enterprise: true },
  { name: "Sales leads to email & dashboard", starter: true, pro: true, enterprise: true },
  { name: "Quoting Agent", starter: false, pro: true, enterprise: true },
  { name: "Advanced configurations", starter: false, pro: true, enterprise: true },
  { name: "Two-way CRM with live tracking", starter: false, pro: true, enterprise: true },
  { name: "CRM Assistant for client requests", starter: false, pro: true, enterprise: true },
  { name: "Custom integrations", starter: false, pro: false, enterprise: true },
  { name: "Dedicated support", starter: false, pro: false, enterprise: true },
  { name: "Tailored onboarding", starter: false, pro: false, enterprise: true },
];

// ── Component ────────────────────────────────────────

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-[13px] font-medium border-none cursor-pointer transition-all ${
              billing === "monthly"
                ? "bg-[#111111] text-white"
                : "bg-transparent text-[#6B7280] hover:text-[#111111]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-5 py-2 rounded-full text-[13px] font-medium border-none cursor-pointer transition-all ${
              billing === "annual"
                ? "bg-[#111111] text-white"
                : "bg-transparent text-[#6B7280] hover:text-[#111111]"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => {
            const pricing = billing === "monthly" ? plan.monthly : plan.annual;
            const isEnterprise = pricing === null;

            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col ${
                  plan.highlighted
                    ? "bg-[#111111] text-white border-2 border-[#111111] relative"
                    : "bg-white border border-[#E5E7EB]"
                }`}
              >
                {/* Badge */}
                {plan.highlighted && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-[#4F46E5] text-white text-[11px] font-semibold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3
                  className={`text-[15px] font-semibold mb-5 ${
                    plan.highlighted ? "text-white" : "text-[#111111]"
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                {isEnterprise ? (
                  <div className="mb-6">
                    <span
                      className={`text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.03em] ${
                        plan.highlighted ? "text-white" : "text-[#111111]"
                      }`}
                    >
                      Custom
                    </span>
                    <p
                      className={`text-[13px] mt-1 ${
                        plan.highlighted ? "text-white/60" : "text-[#9CA3AF]"
                      }`}
                    >
                      Tailored to your needs
                    </p>
                  </div>
                ) : (
                  <PriceDisplay
                    pricing={pricing}
                    billing={billing}
                    highlighted={plan.highlighted}
                  />
                )}

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl text-[14px] font-medium no-underline transition-colors mb-7 ${
                    plan.highlighted
                      ? "bg-white text-[#111111] hover:bg-[#F3F4F6]"
                      : "bg-[#111111] text-white hover:bg-[#1f1f1f]"
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div
                  className={`h-px mb-6 ${
                    plan.highlighted ? "bg-white/10" : "bg-[#E5E7EB]"
                  }`}
                />

                {/* Includes label */}
                {"includesLabel" in plan && plan.includesLabel && (
                  <p
                    className={`text-[12px] font-medium mb-3 ${
                      plan.highlighted ? "text-white/50" : "text-[#9CA3AF]"
                    }`}
                  >
                    {plan.includesLabel}
                  </p>
                )}

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-[#4F46E5]" : "text-[#10B981]"
                        }`}
                        strokeWidth={2.5}
                      />
                      <span
                        className={`text-[13px] leading-snug ${
                          plan.highlighted ? "text-white/80" : "text-[#374151]"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feature Comparison Table ── */}
      <section className="max-w-[960px] mx-auto px-6 py-20 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.02em] text-[#111111]">
            Compare features
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#E5E7EB]">
                <th className="text-left py-4 pr-4 text-[13px] font-medium text-[#9CA3AF] w-[40%]">
                  Feature
                </th>
                <th className="text-center py-4 px-4 text-[13px] font-semibold text-[#111111]">
                  Starter
                </th>
                <th className="text-center py-4 px-4 text-[13px] font-semibold text-[#4F46E5]">
                  Pro
                </th>
                <th className="text-center py-4 px-4 text-[13px] font-semibold text-[#111111]">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((f) => (
                <tr key={f.name} className="border-b border-[#F3F4F6]">
                  <td className="py-3.5 pr-4 text-[14px] text-[#374151]">{f.name}</td>
                  <td className="text-center py-3.5 px-4">
                    {f.starter ? (
                      <Check className="w-4 h-4 text-[#10B981] mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="block w-4 h-[2px] bg-[#E5E7EB] mx-auto rounded" />
                    )}
                  </td>
                  <td className="text-center py-3.5 px-4">
                    {f.pro ? (
                      <Check className="w-4 h-4 text-[#4F46E5] mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="block w-4 h-[2px] bg-[#E5E7EB] mx-auto rounded" />
                    )}
                  </td>
                  <td className="text-center py-3.5 px-4">
                    {f.enterprise ? (
                      <Check className="w-4 h-4 text-[#10B981] mx-auto" strokeWidth={2.5} />
                    ) : (
                      <span className="block w-4 h-[2px] bg-[#E5E7EB] mx-auto rounded" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ── Price Display Helper ─────────────────────────────

function PriceDisplay({
  pricing,
  billing,
  highlighted,
}: {
  pricing: { price: number; activation: number; discount?: string };
  billing: "monthly" | "annual";
  highlighted: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.03em] ${
            highlighted ? "text-white" : "text-[#111111]"
          }`}
        >
          ${pricing.price.toLocaleString()}
        </span>
        <span
          className={`text-[14px] ${
            highlighted ? "text-white/60" : "text-[#9CA3AF]"
          }`}
        >
          /mo
        </span>
      </div>

      <p
        className={`text-[13px] mt-1 ${
          highlighted ? "text-white/60" : "text-[#9CA3AF]"
        }`}
      >
        {pricing.activation > 0
          ? `+ $${pricing.activation} activation fee`
          : "$0 activation fee"}
      </p>

      {billing === "annual" && pricing.discount && (
        <span className="inline-block mt-2 px-2.5 py-1 bg-[#D1FAE5] text-[#10B981] text-[11px] font-semibold rounded-full">
          {pricing.discount}
        </span>
      )}
    </div>
  );
}
