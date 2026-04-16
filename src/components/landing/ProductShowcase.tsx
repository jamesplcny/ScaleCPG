"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Zap,
  Layers,
  ArrowRight,
  Send,
  Sparkles,
  CheckCircle2,
  Package,
  Factory,
  TestTube,
  RefreshCw,
  ClipboardCheck,
  GitBranch,
  Eye,
  Pencil,
} from "lucide-react";

// ── Data ────────────────────────────────────────────

const PRODUCTS = [
  {
    key: "scout",
    icon: Search,
    title: "AI Scout",
    subtitle: "Automated lead capture",
    description:
      "An always-on intake agent that parses every inbound request, extracts requirements, and qualifies opportunities — instantly.",
    href: "/products/scout",
  },
  {
    key: "convert",
    icon: Zap,
    title: "AI Convert",
    subtitle: "Instant quote engine",
    description:
      "Turns qualified specs into priced RFQs — building costs, calculating margins, and surfacing optimizations in seconds.",
    href: "/products/convert",
  },
  {
    key: "platform",
    icon: Layers,
    title: "Execution Platform",
    subtitle: "Quote to production",
    description:
      "Manages samples, revisions, and approvals — then converts accepted quotes into orders. Everything after \"yes,\" finally structured.",
    href: "/products/platform",
  },
] as const;

type ProductKey = (typeof PRODUCTS)[number]["key"];

// ── Component ───────────────────────────────────────

export function ProductShowcase() {
  const [active, setActive] = useState<ProductKey>("scout");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll-driven: divide the section's scrollable height into 3 zones
  useEffect(() => {
    function handleScroll() {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionTop = -rect.top; // how far we've scrolled past the section top
      const scrollableHeight = el.offsetHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, sectionTop / scrollableHeight));
      const idx = Math.min(
        PRODUCTS.length - 1,
        Math.floor(progress * PRODUCTS.length)
      );
      setActive(PRODUCTS[idx].key);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      // Height = viewport + extra scroll room for 3 slides
      style={{ height: `${100 + PRODUCTS.length * 80}vh` }}
    >
      {/* Sticky container that stays in view while user scrolls */}
      <div className="sticky top-0 min-h-screen flex flex-col justify-center py-16">
        <div className="max-w-[1120px] mx-auto px-6 w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[10px] font-semibold tracking-wider text-[#4F46E5] mb-3">
              THE SCALECPG PLATFORM
            </p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-[#111111]">
              From first touch to production.
            </h2>
            <p className="mt-4 text-[17px] text-[#6B7280] max-w-[560px] mx-auto leading-[1.6]">
              Three products. One workflow. Every step from inbound inquiry to
              shipped order — structured and accelerated.
            </p>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-10 items-start">
            {/* Left — product selector */}
            <div className="flex flex-col gap-2">
              {PRODUCTS.map((p) => {
                const Icon = p.icon;
                const isActive = active === p.key;
                const thisIdx = PRODUCTS.findIndex((pr) => pr.key === p.key);
                return (
                  <div
                    key={p.key}
                    className={`text-left rounded-xl p-4 transition-all border-l-[3px] ${
                      isActive
                        ? "bg-white border-l-[#4F46E5] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                        : "bg-transparent border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? "bg-[#EEF2FF]" : "bg-[#F3F4F6]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? "text-[#4F46E5]" : "text-[#9CA3AF]"
                          }`}
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[15px] font-semibold transition-colors ${
                            isActive ? "text-[#111111]" : "text-[#6B7280]"
                          }`}
                        >
                          {p.title}
                        </p>
                        <p className="text-[12px] text-[#9CA3AF]">
                          {p.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Expandable description */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isActive
                          ? "max-h-40 opacity-100 mt-2"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-[13px] text-[#6B7280] leading-[1.6] pl-11">
                        {p.description}
                      </p>
                      <Link
                        href={p.href}
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4F46E5] mt-2 pl-11 no-underline hover:gap-2 transition-all"
                      >
                        Learn more
                        <ArrowRight
                          className="w-3.5 h-3.5"
                          strokeWidth={2.5}
                        />
                      </Link>
                    </div>

                    {/* Scroll progress indicator */}
                    {isActive && (
                      <ScrollProgress
                        sectionRef={sectionRef}
                        index={thisIdx}
                        total={PRODUCTS.length}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right — mockup screens */}
            <div className="relative bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
              {/* Browser chrome */}
              <div className="h-9 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center px-4 gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>

              <div className="h-[480px] relative">
                <FadePanel visible={active === "scout"}>
                  <ScoutScreen />
                </FadePanel>
                <FadePanel visible={active === "convert"}>
                  <ConvertScreen />
                </FadePanel>
                <FadePanel visible={active === "platform"}>
                  <PlatformScreen />
                </FadePanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Scroll progress bar ─────────────────────────────

function ScrollProgress({
  sectionRef,
  index,
  total,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  index: number;
  total: number;
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionTop = -rect.top;
      const scrollableHeight = el.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, sectionTop / scrollableHeight));
      const sliceSize = 1 / total;
      const sliceStart = index * sliceSize;
      const sliceEnd = sliceStart + sliceSize;
      const localProgress = Math.max(
        0,
        Math.min(1, (progress - sliceStart) / (sliceEnd - sliceStart))
      );
      setPct(localProgress * 100);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRef, index, total]);

  return (
    <div className="mt-3 ml-11 h-[2px] bg-[#E5E7EB] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#4F46E5] rounded-full transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Fade wrapper ────────────────────────────────────

function FadePanel({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        visible ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}

// ── Scout screen mockup ─────────────────────────────

function ScoutScreen() {
  return (
    <div className="flex h-full">
      {/* Chat left panel */}
      <div className="w-[220px] border-r border-[#E5E7EB] bg-white p-4 flex flex-col shrink-0">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            <span className="text-[8px] font-semibold tracking-wider text-[#4F46E5]">
              FROM AI SCOUT
            </span>
          </div>
          <p className="text-[12px] font-semibold text-[#111827]">
            Meridian Labs
          </p>
          <p className="text-[10px] text-[#9CA3AF]">Sarah Chen · 87% qualified</p>
        </div>

        <div className="mt-3 space-y-2">
          {[
            ["Product", "Vitamin C serum"],
            ["Volume", "10,000 units"],
            ["Packaging", "30ml dropper"],
            ["Timeline", "Q3 2026"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                {k.toUpperCase()}
              </p>
              <p className="text-[10px] font-medium text-[#111827] mt-0.5">
                {v}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-3">
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-[#10B981]"
              style={{ width: "87%" }}
            />
          </div>
          <button className="w-full bg-[#4F46E5] text-white text-[10px] font-semibold py-2 rounded-lg">
            Submit Inquiry →
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[#F9FAFB] min-w-0">
        <div className="h-10 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0">
          <span className="text-[12px] font-semibold text-[#111827]">
            Meridian Labs
          </span>
          <span className="text-[9px] text-[#9CA3AF]">Powered by ScaleCPG</span>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          <MiniAgent>Hi! How can I help you today?</MiniAgent>
          <MiniVisitor>
            Looking for a manufacturer for a vitamin C serum, 10k units.
          </MiniVisitor>
          <MiniAgent>
            Great! Do you have an existing formula, or do you need us to develop one?
          </MiniAgent>
          <MiniVisitor>
            We have the formula. Need fill &amp; finish into 30ml droppers.
          </MiniVisitor>
          <MiniAgent>Perfect — what&rsquo;s your target launch timeline?</MiniAgent>
        </div>
        <div className="border-t border-[#E5E7EB] bg-white p-2.5 flex items-center gap-2 shrink-0">
          <div className="flex-1 text-[10px] text-[#9CA3AF] border border-[#E5E7EB] rounded-lg px-3 py-1.5">
            Type a message...
          </div>
          <button className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
            <Send className="w-3 h-3 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Convert screen mockup ───────────────────────────

function ConvertScreen() {
  const lines = [
    { label: "Vitamin C active (10%)", unit: "$0.36", total: "$3,600" },
    { label: "Base serum formulation", unit: "$0.68", total: "$6,800" },
    { label: "30ml dropper bottle", unit: "$0.55", total: "$5,500" },
    { label: "Labeling & secondary pkg", unit: "$0.18", total: "$1,800" },
    { label: "Fill, finish & QC", unit: "$0.71", total: "$7,100" },
  ];

  return (
    <div className="flex h-full">
      {/* Scout summary */}
      <div className="w-[200px] border-r border-[#E5E7EB] bg-white shrink-0 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            <span className="text-[8px] font-semibold tracking-wider text-[#4F46E5]">
              FROM AI SCOUT
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-[#111111]">
            North Beauty Co.
          </p>
          <p className="text-[9px] text-[#9CA3AF]">Sarah Chen · 87% qualified</p>
        </div>
        <div className="p-3 space-y-2">
          {[
            ["Product", "Vitamin C serum"],
            ["Service", "Fill & Finish"],
            ["Volume", "10,000 units"],
            ["Packaging", "30ml dropper"],
            ["Timeline", "Q3 2026"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                {k.toUpperCase()}
              </p>
              <p className="text-[10px] font-medium text-[#111827] mt-0.5">
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote builder */}
      <div className="flex-1 bg-[#FAFAFA] p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-bold text-[#111111]">Quote Builder</p>
            <p className="text-[10px] text-[#9CA3AF]">10,000 units · North Beauty Co.</p>
          </div>
          <div className="flex gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-semibold">
              <Eye className="w-3 h-3" strokeWidth={2} /> View
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#6B7280] text-[9px] font-medium">
              <Pencil className="w-3 h-3" strokeWidth={2} /> Edit
            </span>
          </div>
        </div>

        {/* Cost table */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex-1">
          <div className="grid grid-cols-[1fr_70px_80px] px-3 py-1.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <span className="text-[9px] font-semibold text-[#9CA3AF]">COMPONENT</span>
            <span className="text-[9px] font-semibold text-[#9CA3AF] text-right">UNIT</span>
            <span className="text-[9px] font-semibold text-[#9CA3AF] text-right">TOTAL</span>
          </div>
          {lines.map((l) => (
            <div
              key={l.label}
              className="grid grid-cols-[1fr_70px_80px] px-3 py-2 border-b border-[#F3F4F6]"
            >
              <span className="text-[10px] text-[#374151]">{l.label}</span>
              <span className="text-[10px] text-[#111827] font-medium text-right tabular-nums">
                {l.unit}
              </span>
              <span className="text-[10px] text-[#111827] font-medium text-right tabular-nums">
                {l.total}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#9CA3AF]">Unit cost</span>
            <span className="text-[13px] font-bold text-[#111111] ml-1.5">$2.48</span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF]">Total</span>
            <span className="text-[13px] font-bold text-[#111111] ml-1.5">$24,800</span>
          </div>
          <div>
            <span className="text-[10px] text-[#9CA3AF]">Margin</span>
            <span className="text-[13px] font-bold text-[#10B981] ml-1.5">38.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Platform screen mockup ──────────────────────────

function PlatformScreen() {
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-[#4F46E5]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#111111]">Execution Platform</p>
          <p className="text-[10px] text-[#9CA3AF]">North Beauty Co. · PO-2026-0418</p>
        </div>
      </div>

      {/* Flow nodes */}
      <div className="space-y-3 flex-1">
        {/* Quote Accepted */}
        <div className="bg-[#ECFDF5] border border-[#10B981]/30 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#047857]">
                QUOTE ACCEPTED
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#047857]">$48,200</span>
          </div>
        </div>

        {/* Execution layer */}
        <div className="bg-[#111111] rounded-xl p-3.5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-[#818CF8]" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold text-white">
                Execution Layer
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { icon: TestTube, label: "Samples" },
                { icon: RefreshCw, label: "Revisions" },
                { icon: ClipboardCheck, label: "Approvals" },
                { icon: GitBranch, label: "Iterations" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1.5"
                >
                  <Icon className="w-3 h-3 text-[#818CF8] shrink-0" strokeWidth={2.5} />
                  <span className="text-[9px] font-medium text-[#E5E7EB]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Created */}
        <div className="bg-[#EEF2FF] border border-[#4F46E5]/30 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
                ORDER CREATED
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#4F46E5] tabular-nums">
              PO-2026-0418
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#6B7280]">
            Confirmed · 10,000 units · Q3 2026
          </p>
        </div>

        {/* In Production */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-3.5 h-3.5 text-[#9CA3AF]" strokeWidth={2} />
              <span className="text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
                IN PRODUCTION
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#10B981] inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Live sync
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#6B7280]">
            Status updated 2h ago · On schedule
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Mini chat bubbles ───────────────────────────────

function MiniAgent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="max-w-[80%] bg-white border border-[#E5E7EB] text-[#374151] text-[10px] leading-[1.5] px-2.5 py-1.5 rounded-xl rounded-tl-sm">
        {children}
      </div>
    </div>
  );
}

function MiniVisitor({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[#4F46E5] text-white text-[10px] leading-[1.5] px-2.5 py-1.5 rounded-xl rounded-tr-sm">
        {children}
      </div>
    </div>
  );
}
