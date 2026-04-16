"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  FileText,
  Pencil,
  Eye,
  Check,
  X,
} from "lucide-react";

type TabKey = "view" | "edit";

const TABS: {
  key: TabKey;
  title: string;
  subtitle: string;
  icon: typeof Eye;
}[] = [
  {
    key: "view",
    title: "Quote view",
    subtitle: "Auto-built from the lead spec",
    icon: Eye,
  },
  {
    key: "edit",
    title: "Edit & optimize",
    subtitle: "Tweak prices, swap in optimizations",
    icon: Pencil,
  },
];

const COST_LINES: {
  id: string;
  label: string;
  qty: number;
  qtyLabel: string;
  defaultUnit: number;
}[] = [
  { id: "vitc", label: "Vitamin C active (10%)", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.42 },
  { id: "base", label: "Base serum formulation", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.68 },
  { id: "dropper", label: "30ml dropper bottle", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.55 },
  { id: "label", label: "Labeling & secondary pkg", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.18 },
  { id: "fill", label: "Fill, finish & QC", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.71 },
];

const OPTIMIZATIONS: {
  id: string;
  text: string;
  targetLine: string;
  optimizedUnit: number;
  save: number;
}[] = [
  {
    id: "lascorbic",
    text: "Switch to 9.5% L-ascorbic",
    targetLine: "vitc",
    optimizedUnit: 0.36,
    save: 600,
  },
  {
    id: "bulk_dropper",
    text: "Bulk dropper SKU at 12k MOQ",
    targetLine: "dropper",
    optimizedUnit: 0.44,
    save: 1100,
  },
];

const DEFAULT_PRICES: Record<string, number> = Object.fromEntries(
  COST_LINES.map((l) => [l.id, l.defaultUnit])
);

const DEFAULT_QUANTITIES: Record<string, number> = Object.fromEntries(
  COST_LINES.map((l) => [l.id, l.qty])
);

export function QuoteShowcase() {
  const [active, setActive] = useState<TabKey>("view");

  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">

      <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-8">
        {/* Left rail — tab buttons */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`shrink-0 md:shrink text-left rounded-xl p-4 transition-all cursor-pointer border-l-2 ${
                  isActive
                    ? "bg-[#F5F5F7] border-[#4F46E5]"
                    : "bg-transparent border-transparent hover:bg-[#F5F5F7]/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#4F46E5]" : "text-[#6B7280]"
                    }`}
                    strokeWidth={2}
                  />
                  <span
                    className={`text-[15px] ${
                      isActive
                        ? "font-semibold text-[#111111]"
                        : "font-medium text-[#6B7280]"
                    }`}
                  >
                    {tab.title}
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-[13px] leading-snug pl-[26px] ${
                    isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"
                  }`}
                >
                  {tab.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Mockup frame */}
        <div className="relative bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="h-9 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center px-4 gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="h-[540px] overflow-hidden">
            {active === "view" && (
              <QuoteViewMockup onEdit={() => setActive("edit")} />
            )}
            {active === "edit" && (
              <QuoteEditMockup onDone={() => setActive("view")} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Shared — Scout's lead summary (left panel)
   ───────────────────────────────────────────────────────────────── */

function ScoutSummaryPanel() {
  return (
    <div className="w-[240px] border-r border-[#E5E7EB] bg-white shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
          <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
            FROM AI SCOUT
          </span>
        </div>
        <h4 className="mt-1 text-[12px] font-semibold text-[#111111]">
          North Beauty Co.
        </h4>
        <p className="text-[10px] text-[#9CA3AF]">Sarah Chen · 87% qualified</p>
      </div>

      <div className="p-4 space-y-2.5">
        {[
          ["Product", "Vitamin C serum"],
          ["Service", "Fill & Finish"],
          ["Volume", "10,000 units"],
          ["Packaging", "30ml dropper"],
          ["Formulation", "Complete"],
          ["Timeline", "Q3 2026"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
              {k.toUpperCase()}
            </p>
            <p className="text-[11px] font-medium text-[#111827] mt-0.5">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup A — View Quote (read-only)
   ───────────────────────────────────────────────────────────────── */

function QuoteViewMockup({ onEdit }: { onEdit: () => void }) {
  const subtotal = COST_LINES.reduce(
    (s, l) => s + l.defaultUnit * l.qty,
    0
  );
  const margin = 0.47;
  const quoteTotal = Math.round(subtotal / (1 - margin));
  const marginDollars = quoteTotal - subtotal;

  return (
    <div className="flex h-full">
      <ScoutSummaryPanel />

      <div className="flex-1 bg-[#FAFAFA] overflow-hidden relative">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#111111]">
                Quote Builder
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Auto-generated from lead spec · QT-2026-0418
              </p>
            </div>
            <span className="text-[9px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
              AI CONVERT
            </span>
          </div>

          {/* Cost lines */}
          <div className="mt-3 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                COST LINE
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                QTY
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                UNIT
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                TOTAL
              </p>
            </div>
            {COST_LINES.map((line, i) => (
              <div
                key={line.id}
                className={`grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 ${
                  i !== 0 ? "border-t border-[#F3F4F6]" : ""
                }`}
              >
                <p className="text-[10px] text-[#374151] truncate">
                  {line.label}
                </p>
                <p className="text-[10px] text-[#9CA3AF] text-right tabular-nums">
                  {line.qtyLabel}
                </p>
                <p className="text-[10px] text-[#9CA3AF] text-right tabular-nums">
                  ${line.defaultUnit.toFixed(2)}
                </p>
                <p className="text-[10px] font-semibold text-[#111827] text-right tabular-nums">
                  ${(line.defaultUnit * line.qty).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[10px] font-semibold text-[#6B7280]">
                Cost subtotal
              </p>
              <span />
              <span />
              <p className="text-[10px] font-bold text-[#111111] text-right tabular-nums">
                ${subtotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Margin + total */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp
                  className="w-3 h-3 text-[#10B981]"
                  strokeWidth={2.5}
                />
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                  MARGIN
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-[#10B981]">
                  {Math.round(margin * 100)}%
                </span>
                <span className="text-[10px] text-[#6B7280] tabular-nums">
                  ${marginDollars.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
              <div className="relative">
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                  QUOTE TOTAL
                </span>
                <p className="mt-1 text-[16px] font-bold text-white tabular-nums">
                  ${quoteTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Optimization suggestions */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
                COST OPTIMIZATIONS
              </span>
            </div>
            <div className="space-y-1.5">
              {OPTIMIZATIONS.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between gap-2 bg-[#EEF2FF]/50 border border-[#4F46E5]/15 rounded-md px-2.5 py-1.5"
                >
                  <p className="text-[10px] text-[#374151] truncate">
                    {opt.text}
                  </p>
                  <span className="text-[10px] font-bold text-[#10B981] tabular-nums shrink-0">
                    −${opt.save.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <button
          onClick={onEdit}
          className="absolute bottom-4 left-4 bg-white border border-[#E5E7EB] text-[#111111] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 hover:bg-[#F9FAFB] transition-colors"
        >
          <Pencil className="w-3 h-3" strokeWidth={2.5} />
          Edit
        </button>
        <button className="absolute bottom-4 right-4 bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
          <FileText className="w-3 h-3" strokeWidth={2.5} />
          Send RFQ
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup B — Edit Quote (interactive)
   ───────────────────────────────────────────────────────────────── */

// Edit screen is read-only — one optimization is pre-applied so the
// interchangeable / optimized state is visible without any user interaction.
const PREAPPLIED: Record<string, boolean> = { lascorbic: true };

const STATIC_PRICES: Record<string, number> = (() => {
  const next = { ...DEFAULT_PRICES };
  for (const opt of OPTIMIZATIONS) {
    if (PREAPPLIED[opt.id]) next[opt.targetLine] = opt.optimizedUnit;
  }
  return next;
})();

function QuoteEditMockup({ onDone }: { onDone: () => void }) {
  const prices = STATIC_PRICES;
  const quantities = DEFAULT_QUANTITIES;
  const applied = PREAPPLIED;

  const subtotal = COST_LINES.reduce(
    (s, l) =>
      s + (prices[l.id] ?? l.defaultUnit) * (quantities[l.id] ?? l.qty),
    0
  );
  const margin = 0.47;
  const quoteTotal = Math.round(subtotal / (1 - margin));
  const marginDollars = quoteTotal - subtotal;

  return (
    <div className="flex h-full">
      <ScoutSummaryPanel />

      <div className="flex-1 bg-[#FAFAFA] overflow-hidden relative">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#111111]">
                Edit Quote
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Adjust unit costs or apply Convert&rsquo;s suggestions
              </p>
            </div>
            <span className="text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />
              EDITING
            </span>
          </div>

          {/* Editable cost lines */}
          <div className="mt-3 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                COST LINE
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                QTY
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                UNIT
              </p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">
                TOTAL
              </p>
            </div>
            {COST_LINES.map((line, i) => {
              const unit = prices[line.id] ?? line.defaultUnit;
              const qty = quantities[line.id] ?? line.qty;
              const wasOptimized = unit !== line.defaultUnit;
              return (
                <div
                  key={line.id}
                  className={`grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 items-center ${
                    i !== 0 ? "border-t border-[#F3F4F6]" : ""
                  } ${wasOptimized ? "bg-[#ECFDF5]/30" : ""}`}
                >
                  <p className="text-[10px] text-[#374151] truncate">
                    {line.label}
                  </p>
                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center bg-white border border-[#4F46E5]/30 rounded px-1 focus-within:border-[#4F46E5] transition-colors">
                      <input
                        type="text"
                        value={qty.toLocaleString()}
                        readOnly
                        tabIndex={-1}
                        className="w-14 text-[10px] font-semibold text-[#111827] text-right tabular-nums bg-transparent outline-none cursor-default"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center bg-white border border-[#4F46E5]/30 rounded px-1 focus-within:border-[#4F46E5] transition-colors">
                      <span className="text-[10px] text-[#9CA3AF]">$</span>
                      <input
                        type="text"
                        value={unit.toFixed(2)}
                        readOnly
                        tabIndex={-1}
                        className="w-10 text-[10px] font-semibold text-[#111827] text-right tabular-nums bg-transparent outline-none cursor-default"
                      />
                    </div>
                  </div>
                  <p
                    className={`text-[10px] font-semibold text-right tabular-nums ${
                      wasOptimized ? "text-[#047857]" : "text-[#111827]"
                    }`}
                  >
                    ${(unit * qty).toLocaleString()}
                  </p>
                </div>
              );
            })}
            <div className="grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[10px] font-semibold text-[#6B7280]">
                Cost subtotal
              </p>
              <span />
              <span />
              <p className="text-[10px] font-bold text-[#111111] text-right tabular-nums">
                ${subtotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Margin + total */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp
                  className="w-3 h-3 text-[#10B981]"
                  strokeWidth={2.5}
                />
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                  MARGIN
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-[#10B981]">
                  {Math.round(margin * 100)}%
                </span>
                <span className="text-[10px] text-[#6B7280] tabular-nums">
                  ${marginDollars.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
              <div className="relative">
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">
                  QUOTE TOTAL
                </span>
                <p className="mt-1 text-[16px] font-bold text-white tabular-nums">
                  ${quoteTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Toggleable optimizations */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
                COST OPTIMIZATIONS · TAP TO APPLY
              </span>
            </div>
            <div className="space-y-1.5">
              {OPTIMIZATIONS.map((opt) => {
                const isOn = !!applied[opt.id];
                return (
                  <div
                    key={opt.id}
                    className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 border transition-all ${
                      isOn
                        ? "bg-[#10B981]/10 border-[#10B981]/40"
                        : "bg-[#EEF2FF]/50 border-[#4F46E5]/15 hover:bg-[#EEF2FF] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isOn
                            ? "bg-[#10B981] border border-[#10B981]"
                            : "bg-white border border-[#4F46E5]/40"
                        }`}
                      >
                        {isOn && (
                          <Check
                            className="w-2 h-2 text-white"
                            strokeWidth={3.5}
                          />
                        )}
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isOn
                            ? "font-semibold text-[#047857]"
                            : "text-[#374151]"
                        }`}
                      >
                        {opt.text}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#10B981] tabular-nums shrink-0">
                      −${opt.save.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <button
          onClick={onDone}
          className="absolute bottom-4 left-4 bg-white border border-[#E5E7EB] text-[#6B7280] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 hover:bg-[#F9FAFB] transition-colors"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
          Cancel
        </button>
        <button
          onClick={onDone}
          className="absolute bottom-4 right-4 bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5"
        >
          <Check className="w-3 h-3" strokeWidth={2.5} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
