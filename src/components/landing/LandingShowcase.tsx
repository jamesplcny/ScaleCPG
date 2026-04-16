"use client";

import { useState } from "react";
import {
  Bot,
  Inbox,
  Eye,
  Pencil,
  Send,
  Clock,
  Sparkles,
  ChevronDown,
  TrendingUp,
  FileText,
  Check,
  X,
  Layers,
  GitBranch,
  RefreshCw,
  TestTube,
  ClipboardCheck,
  Package,
  MessageSquare,
  Home,
  Users,
  Settings,
  FileCheck,
  LayoutDashboard,
  FolderOpen,
  ChevronRight,
  Upload,
  Search,
  Hammer,
  AlertCircle,
} from "lucide-react";

// ── Tabs ────────────────────────────────────────────

type TabKey = "inbound" | "leads" | "edit" | "orders";

const TABS: {
  key: TabKey;
  title: string;
  subtitle: string;
  icon: typeof Bot;
}[] = [
  {
    key: "inbound",
    title: "Automated inbound",
    subtitle: "AI chat that qualifies every lead",
    icon: Bot,
  },
  {
    key: "leads",
    title: "Qualified leads",
    subtitle: "Sorted leads, summaries & transcripts",
    icon: Inbox,
  },
  {
    key: "edit",
    title: "Edit & optimize",
    subtitle: "Tweak prices, swap in optimizations",
    icon: Pencil,
  },
  {
    key: "orders",
    title: "Convert quotes to orders",
    subtitle: "Client portal with live approvals",
    icon: ClipboardCheck,
  },
];

// ── Quote data ──────────────────────────────────────

const COST_LINES = [
  { id: "vitc", label: "Vitamin C active (10%)", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.42 },
  { id: "base", label: "Base serum formulation", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.68 },
  { id: "dropper", label: "30ml dropper bottle", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.55 },
  { id: "label", label: "Labeling & secondary pkg", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.18 },
  { id: "fill", label: "Fill, finish & QC", qty: 10000, qtyLabel: "10,000 u", defaultUnit: 0.71 },
];

const OPTIMIZATIONS = [
  { id: "lascorbic", text: "Switch to 9.5% L-ascorbic", targetLine: "vitc", optimizedUnit: 0.36, save: 600 },
  { id: "bulk_dropper", text: "Bulk dropper SKU at 12k MOQ", targetLine: "dropper", optimizedUnit: 0.44, save: 1100 },
];

const DEFAULT_PRICES: Record<string, number> = Object.fromEntries(
  COST_LINES.map((l) => [l.id, l.defaultUnit])
);
const DEFAULT_QUANTITIES: Record<string, number> = Object.fromEntries(
  COST_LINES.map((l) => [l.id, l.qty])
);
const PREAPPLIED: Record<string, boolean> = { lascorbic: true };
const STATIC_PRICES: Record<string, number> = (() => {
  const next = { ...DEFAULT_PRICES };
  for (const opt of OPTIMIZATIONS) {
    if (PREAPPLIED[opt.id]) next[opt.targetLine] = opt.optimizedUnit;
  }
  return next;
})();

// ── Lead list data ──────────────────────────────────

const LEAD_LIST = [
  { initials: "SC", name: "Sarah Chen", company: "North Beauty Co.", summary: "Vitamin C serum, 10k units, formula in hand…", score: 87, when: "2h ago", selected: true },
  { initials: "MR", name: "Marcus Reed", company: "Glow Standard", summary: "Retinol night cream, looking for full-service…", score: 79, when: "5h ago", selected: false },
  { initials: "AP", name: "Aria Patel", company: "Lumen Skincare", summary: "Niacinamide toner, 25k units, Q4 launch…", score: 72, when: "Yesterday", selected: false },
  { initials: "TJ", name: "Tomás Jiménez", company: "Casa Verde", summary: "Exploring options for organic lip balm line…", score: 54, when: "2d ago", selected: false },
  { initials: "EK", name: "Eun Kim", company: "Petal & Powder", summary: "Just browsing, no clear product yet…", score: 31, when: "3d ago", selected: false },
];

function leadScoreColor(score: number): string {
  if (score >= 65) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

// ── Main Component ──────────────────────────────────

export function LandingShowcase() {
  const [active, setActive] = useState<TabKey>("inbound");

  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">

      <div className="grid md:grid-cols-[280px_1fr] gap-6 md:gap-8">
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
          {/* Browser chrome bar */}
          <div className="h-9 border-b border-[#E5E7EB] bg-[#FAFAFA] flex items-center px-4 gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>

          {/* Mockup body */}
          <div className="h-[540px] overflow-hidden">
            {active === "inbound" && <ChatWidgetMockup />}
            {active === "leads" && <LeadsMockup />}
            {active === "edit" && <QuoteEditMockup />}
            {active === "orders" && <OrdersMockup />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 1 — Chat Widget (Automated inbound)
   ───────────────────────────────────────────────────────────────── */

function ChatWidgetMockup() {
  return (
    <div className="relative h-full">
      {/* Background — manufacturer "Contact Us" page */}
      <div className="h-full bg-white p-5 overflow-hidden">
        {/* Fake nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <span className="text-[14px] font-bold text-[#111827]">Meridian Labs</span>
            <div className="flex gap-4">
              {["Home", "Services", "About", "Contact"].map((l) => (
                <span
                  key={l}
                  className={`text-[11px] ${
                    l === "Contact"
                      ? "text-[#4F46E5] font-semibold"
                      : "text-[#6B7280]"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">Los Angeles, CA</span>
        </div>

        {/* Page content */}
        <div className="max-w-[400px]">
          <h2 className="text-[18px] font-bold text-[#111111] mb-1">
            Contact Us
          </h2>
          <p className="text-[11px] text-[#6B7280] leading-[1.6] mb-5">
            Ready to bring your product to life? Fill out the form below and
            our team will get back to you within 2–3 business days.
          </p>

          {/* Fake contact form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-medium text-[#6B7280] mb-1">
                  First Name
                </label>
                <div className="h-7 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]" />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-[#6B7280] mb-1">
                  Last Name
                </label>
                <div className="h-7 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-[#6B7280] mb-1">
                Work Email
              </label>
              <div className="h-7 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]" />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-[#6B7280] mb-1">
                Tell us about your project
              </label>
              <div className="h-16 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]" />
            </div>
            <button className="px-4 py-1.5 bg-[#111111] text-white text-[10px] font-semibold rounded-md">
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Chat widget modal */}
      <div className="absolute inset-3 flex">
        <div className="w-full bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden flex">
          {/* Left panel */}
          <div className="hidden sm:flex flex-col w-[240px] border-r border-[#E5E7EB] bg-white p-4 shrink-0">
            <div>
              <h4 className="text-[14px] font-semibold text-[#111827]">Welcome!</h4>
              <p className="mt-1 text-[12px] font-medium text-[#374151]">Meridian Labs</p>
              <p className="text-[10px] text-[#9CA3AF]">Los Angeles, CA</p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {["Formulation", "Private Label", "Fill & Finish"].map((s) => (
                <span key={s} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">{s}</span>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              <div>
                <label className="block text-[9px] font-medium text-[#6B7280] mb-1">Work Email</label>
                <div className="text-[11px] text-[#111827] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white">sarah@northbeauty.co</div>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-[#6B7280] mb-1">Contact Name</label>
                <div className="text-[11px] text-[#111827] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white">Sarah Chen</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3 h-3 text-[#F59E0B]" strokeWidth={2.5} />
                <span className="text-[8px] font-semibold tracking-wider text-[#B45309]">STRENGTH OF INQUIRY</span>
              </div>
              <div className="h-[4px] bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#86EFAC] to-[#FACC15]" style={{ width: "66.66%" }} />
              </div>
              <button className="mt-2 w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors">
                <span className="text-[9px] font-semibold text-[#374151]">View Qualifications</span>
                <span className="text-[9px] font-bold text-[#F59E0B] tabular-nums">4/6</span>
              </button>
              <button className="mt-1.5 w-full inline-flex items-center justify-between px-2 py-1.5 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors">
                <span className="text-[9px] font-semibold text-[#374151]">View Suggestions</span>
                <span className="text-[9px] font-bold text-[#4F46E5] tabular-nums">3</span>
              </button>
            </div>
            <div className="mt-auto pt-4">
              <button className="w-full bg-[#4F46E5] text-white text-[11px] font-semibold py-2 rounded-lg">Submit Inquiry →</button>
            </div>
          </div>

          {/* Right panel — conversation */}
          <div className="flex-1 flex flex-col bg-[#F9FAFB] min-w-0">
            <div className="h-10 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0">
              <span className="text-[12px] font-semibold text-[#111827]">Meridian Labs</span>
              <span className="text-[9px] text-[#9CA3AF]">Powered by ScaleCPG</span>
            </div>
            <div className="flex-1 overflow-hidden p-3 space-y-2.5">
              <AgentBubble>Hi! How can I help you today?</AgentBubble>
              <VisitorBubble>Looking for a manufacturer for a vitamin C serum, 10k units.</VisitorBubble>
              <AgentBubble>Great! Do you have an existing formula, or do you need us to develop one?</AgentBubble>
              <VisitorBubble>We have the formula. Need fill &amp; finish into 30ml dropper bottles.</VisitorBubble>
              <AgentBubble>Perfect — what&rsquo;s your target launch timeline?</AgentBubble>
            </div>
            <div className="border-t border-[#E5E7EB] bg-white p-2.5 flex items-center gap-2 shrink-0">
              <div className="flex-1 text-[11px] text-[#9CA3AF] border border-[#E5E7EB] rounded-lg px-3 py-1.5">Type a message...</div>
              <button className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="max-w-[80%] bg-white border border-[#E5E7EB] text-[#374151] text-[12px] leading-[1.5] px-3 py-2 rounded-2xl rounded-tl-sm">{children}</div>
    </div>
  );
}

function VisitorBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[#4F46E5] text-white text-[12px] leading-[1.5] px-3 py-2 rounded-2xl rounded-tr-sm">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 2 — Sales Leads (Qualified leads)
   ───────────────────────────────────────────────────────────────── */

const SIDEBAR_NAV = [
  { icon: Home, label: "Dashboard", active: false },
  { icon: Users, label: "Clients", active: false },
  { icon: MessageSquare, label: "Sales Leads", active: true },
  { icon: Settings, label: "Settings", active: false },
];

function LeadsMockup() {
  return (
    <div className="flex h-full">
      {/* Mini sidebar */}
      <div className="w-[160px] bg-white border-r border-[#E5E7EB] shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <p className="text-[12px] font-semibold text-[#111111]">ScaleCPG</p>
          <p className="text-[9px] text-[#9CA3AF]">Manufacturing Suite</p>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] ${
                  item.active
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                    : "text-[#6B7280]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-10 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-4 shrink-0">
          <p className="text-[12px] font-semibold text-[#111827]">Sales Leads</p>
          <p className="text-[10px] text-[#9CA3AF]">Sorted by score · 5 today</p>
        </div>

        {/* Lead list + detail split */}
        <div className="flex flex-1 min-h-0">
          {/* Lead list */}
          <div className="w-[200px] border-r border-[#E5E7EB] bg-white overflow-hidden shrink-0">
            {LEAD_LIST.map((lead) => (
              <div key={lead.initials} className={`px-3 py-2.5 border-b border-[#F3F4F6] border-l-2 ${lead.selected ? "border-l-[#4F46E5] bg-[#EEF2FF]/40" : "border-l-transparent"}`}>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-semibold flex items-center justify-center shrink-0">{lead.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-[#111111] truncate">{lead.name}</span>
                      <span className="text-[9px] font-bold shrink-0" style={{ color: leadScoreColor(lead.score) }}>{lead.score}%</span>
                    </div>
                    <p className="text-[9px] text-[#9CA3AF] truncate">{lead.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lead detail */}
          <div className="flex-1 bg-[#FAFAFA] overflow-hidden relative">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#111111]">Sarah Chen</h3>
                  <p className="text-[11px] text-[#6B7280]">North Beauty Co.</p>
                  <p className="text-[10px] text-[#9CA3AF]">sarah@northbeauty.co</p>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-bold text-[#10B981] leading-none">87%</div>
                  <p className="text-[9px] font-medium text-[#10B981] mt-0.5">High intent</p>
                </div>
              </div>

              {/* AI Scout — captured data */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Search className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
                  <p className="text-[8px] font-semibold tracking-wider text-[#4F46E5]">CAPTURED BY AI SCOUT</p>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 bg-white border border-[#E5E7EB] rounded-lg p-2.5">
                  {[
                    ["Product", "Vitamin C serum"],
                    ["Service", "Fill & Finish"],
                    ["Volume", "10,000 units"],
                    ["Packaging", "30ml dropper"],
                    ["Formulation", "Complete"],
                    ["Timeline", "Q3 2026"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-[9px] text-[#9CA3AF]">{k}</span>
                      <span className="text-[9px] font-medium text-[#111827] truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Forge — gap detection + suggestions */}
              <div className="mt-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Hammer className="w-3 h-3 text-[#F59E0B]" strokeWidth={2.5} />
                  <p className="text-[8px] font-semibold tracking-wider text-[#F59E0B]">AI FORGE — GAP ANALYSIS</p>
                </div>
                <div className="bg-white border border-[#F59E0B]/20 rounded-lg p-2.5 space-y-2">
                  {/* Missing spec filled */}
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5 text-[#F59E0B]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[#111111]">Stabilizer not specified</p>
                      <p className="text-[9px] text-[#6B7280]">Forge suggests: Ferulic acid (0.5%) for Vitamin C stability</p>
                    </div>
                  </div>
                  {/* Cost estimate */}
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-2.5 h-2.5 text-[#10B981]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[#111111]">Estimated unit cost: $2.48</p>
                      <p className="text-[9px] text-[#6B7280]">Based on 10k units, 30ml dropper, fill &amp; finish</p>
                    </div>
                  </div>
                  {/* Quote draft */}
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-2.5 h-2.5 text-[#4F46E5]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-[#111111]">Quote draft ready</p>
                      <p className="text-[9px] text-[#6B7280]">$24,800 at 47% margin — ready for your review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="bg-white border border-[#E5E7EB] text-[#111111] text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#F9FAFB] transition-colors">Edit Quote</button>
              <button className="bg-[#F59E0B] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(245,158,11,0.25)] inline-flex items-center gap-1.5">
                <Hammer className="w-3 h-3" strokeWidth={2.5} />
                Forge
              </button>
              <button className="bg-[#4F46E5] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                View Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Shared — Scout summary panel
   ───────────────────────────────────────────────────────────────── */

function ScoutSummaryPanel() {
  return (
    <div className="w-[240px] border-r border-[#E5E7EB] bg-white shrink-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
          <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">FROM AI SCOUT</span>
        </div>
        <h4 className="mt-1 text-[12px] font-semibold text-[#111111]">North Beauty Co.</h4>
        <p className="text-[10px] text-[#9CA3AF]">Sarah Chen · 87% qualified</p>
      </div>
      <div className="p-4 space-y-2.5">
        {[["Product", "Vitamin C serum"], ["Service", "Fill & Finish"], ["Volume", "10,000 units"], ["Packaging", "30ml dropper"], ["Formulation", "Complete"], ["Timeline", "Q3 2026"]].map(([k, v]) => (
          <div key={k}>
            <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF]">{k.toUpperCase()}</p>
            <p className="text-[11px] font-medium text-[#111827] mt-0.5">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 3 — Quote View
   ───────────────────────────────────────────────────────────────── */

function QuoteViewMockup({ onEdit }: { onEdit: () => void }) {
  const subtotal = COST_LINES.reduce((s, l) => s + l.defaultUnit * l.qty, 0);
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
              <h3 className="text-[15px] font-bold text-[#111111]">Quote Builder</h3>
              <p className="text-[11px] text-[#6B7280]">Auto-generated from lead spec · QT-2026-0418</p>
            </div>
            <span className="text-[9px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />AI CONVERT
            </span>
          </div>
          <div className="mt-3 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">COST LINE</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">QTY</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">UNIT</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">TOTAL</p>
            </div>
            {COST_LINES.map((line, i) => (
              <div key={line.id} className={`grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 ${i !== 0 ? "border-t border-[#F3F4F6]" : ""}`}>
                <p className="text-[10px] text-[#374151] truncate">{line.label}</p>
                <p className="text-[10px] text-[#9CA3AF] text-right tabular-nums">{line.qtyLabel}</p>
                <p className="text-[10px] text-[#9CA3AF] text-right tabular-nums">${line.defaultUnit.toFixed(2)}</p>
                <p className="text-[10px] font-semibold text-[#111827] text-right tabular-nums">${(line.defaultUnit * line.qty).toLocaleString()}</p>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_60px_50px_60px] gap-2 px-3 py-1.5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[10px] font-semibold text-[#6B7280]">Cost subtotal</p>
              <span /><span />
              <p className="text-[10px] font-bold text-[#111111] text-right tabular-nums">${subtotal.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">MARGIN</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-[#10B981]">{Math.round(margin * 100)}%</span>
                <span className="text-[10px] text-[#6B7280] tabular-nums">${marginDollars.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
              <div className="relative">
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">QUOTE TOTAL</span>
                <p className="mt-1 text-[16px] font-bold text-white tabular-nums">${quoteTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">COST OPTIMIZATIONS</span>
            </div>
            <div className="space-y-1.5">
              {OPTIMIZATIONS.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between gap-2 bg-[#EEF2FF]/50 border border-[#4F46E5]/15 rounded-md px-2.5 py-1.5">
                  <p className="text-[10px] text-[#374151] truncate">{opt.text}</p>
                  <span className="text-[10px] font-bold text-[#10B981] tabular-nums shrink-0">−${opt.save.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onEdit} className="absolute bottom-4 left-4 bg-white border border-[#E5E7EB] text-[#111111] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 hover:bg-[#F9FAFB] transition-colors">
          <Pencil className="w-3 h-3" strokeWidth={2.5} />Edit
        </button>
        <button className="absolute bottom-4 right-4 bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
          <FileText className="w-3 h-3" strokeWidth={2.5} />Send RFQ
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 4 — Edit Quote
   ───────────────────────────────────────────────────────────────── */

function QuoteEditMockup() {
  const prices = STATIC_PRICES;
  const quantities = DEFAULT_QUANTITIES;
  const applied = PREAPPLIED;

  const subtotal = COST_LINES.reduce(
    (s, l) => s + (prices[l.id] ?? l.defaultUnit) * (quantities[l.id] ?? l.qty), 0
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
              <h3 className="text-[15px] font-bold text-[#111111]">Edit Quote</h3>
              <p className="text-[11px] text-[#6B7280]">Adjust unit costs or apply Convert&rsquo;s suggestions</p>
            </div>
            <span className="text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full inline-flex items-center gap-1">
              <Pencil className="w-2.5 h-2.5" strokeWidth={2.5} />EDITING
            </span>
          </div>
          <div className="mt-3 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">COST LINE</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">QTY</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">UNIT</p>
              <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] text-right">TOTAL</p>
            </div>
            {COST_LINES.map((line, i) => {
              const unit = prices[line.id] ?? line.defaultUnit;
              const qty = quantities[line.id] ?? line.qty;
              const wasOptimized = unit !== line.defaultUnit;
              return (
                <div key={line.id} className={`grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 items-center ${i !== 0 ? "border-t border-[#F3F4F6]" : ""} ${wasOptimized ? "bg-[#ECFDF5]/30" : ""}`}>
                  <p className="text-[10px] text-[#374151] truncate">{line.label}</p>
                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center bg-white border border-[#4F46E5]/30 rounded px-1">
                      <input type="text" value={qty.toLocaleString()} readOnly tabIndex={-1} className="w-14 text-[10px] font-semibold text-[#111827] text-right tabular-nums bg-transparent outline-none cursor-default" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center bg-white border border-[#4F46E5]/30 rounded px-1">
                      <span className="text-[10px] text-[#9CA3AF]">$</span>
                      <input type="text" value={unit.toFixed(2)} readOnly tabIndex={-1} className="w-10 text-[10px] font-semibold text-[#111827] text-right tabular-nums bg-transparent outline-none cursor-default" />
                    </div>
                  </div>
                  <p className={`text-[10px] font-semibold text-right tabular-nums ${wasOptimized ? "text-[#047857]" : "text-[#111827]"}`}>${(unit * qty).toLocaleString()}</p>
                </div>
              );
            })}
            <div className="grid grid-cols-[1fr_72px_60px_60px] gap-2 px-3 py-1.5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[10px] font-semibold text-[#6B7280]">Cost subtotal</p>
              <span /><span />
              <p className="text-[10px] font-bold text-[#111111] text-right tabular-nums">${subtotal.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">MARGIN</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold text-[#10B981]">{Math.round(margin * 100)}%</span>
                <span className="text-[10px] text-[#6B7280] tabular-nums">${marginDollars.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-[#111111] rounded-lg p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
              <div className="relative">
                <span className="text-[8px] font-semibold tracking-wider text-[#9CA3AF]">QUOTE TOTAL</span>
                <p className="mt-1 text-[16px] font-bold text-white tabular-nums">${quoteTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
              <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">COST OPTIMIZATIONS · TAP TO APPLY</span>
            </div>
            <div className="space-y-1.5">
              {OPTIMIZATIONS.map((opt) => {
                const isOn = !!applied[opt.id];
                return (
                  <div key={opt.id} className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 border transition-all ${isOn ? "bg-[#10B981]/10 border-[#10B981]/40" : "bg-[#EEF2FF]/50 border-[#4F46E5]/15 hover:bg-[#EEF2FF] cursor-pointer"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOn ? "bg-[#10B981] border border-[#10B981]" : "bg-white border border-[#4F46E5]/40"}`}>
                        {isOn && <Check className="w-2 h-2 text-white" strokeWidth={3.5} />}
                      </div>
                      <p className={`text-[10px] truncate ${isOn ? "font-semibold text-[#047857]" : "text-[#374151]"}`}>{opt.text}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#10B981] tabular-nums shrink-0">−${opt.save.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <button className="absolute bottom-4 left-4 bg-white border border-[#E5E7EB] text-[#6B7280] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 hover:bg-[#F9FAFB] transition-colors">
          <X className="w-3 h-3" strokeWidth={2.5} />Cancel
        </button>
        <button className="absolute bottom-4 right-4 bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={2.5} />Save Changes
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 5 — Execution / Product Iteration
   ───────────────────────────────────────────────────────────────── */

const ITERATIONS = [
  { label: "Formulation", version: "v3.2", status: "In revision", active: true },
  { label: "Packaging", version: "v2.1", status: "Approved", active: false },
  { label: "Label Design", version: "v1.4", status: "Pending review", active: false },
];

const ACTIVITY_FEED = [
  {
    icon: TestTube,
    actor: "North Beauty Co.",
    action: "requested a sample for Formulation v3.2",
    time: "2h ago",
    color: "text-[#4F46E5]",
    bg: "bg-[#EEF2FF]",
  },
  {
    icon: RefreshCw,
    actor: "Meridian Labs",
    action: "uploaded revised formulation — switched to stabilized L-ascorbic acid",
    time: "1h ago",
    color: "text-[#F59E0B]",
    bg: "bg-[#FEF3C7]",
  },
  {
    icon: ClipboardCheck,
    actor: "North Beauty Co.",
    action: "approved Packaging v2.1 — 30ml frosted dropper bottle",
    time: "45m ago",
    color: "text-[#10B981]",
    bg: "bg-[#ECFDF5]",
  },
  {
    icon: MessageSquare,
    actor: "Sarah Chen",
    action: "left feedback: \"Can we try a matte finish on the label instead of gloss?\"",
    time: "20m ago",
    color: "text-[#6B7280]",
    bg: "bg-[#F3F4F6]",
  },
  {
    icon: Package,
    actor: "Meridian Labs",
    action: "shipped sample batch #3 — tracking added",
    time: "10m ago",
    color: "text-[#4F46E5]",
    bg: "bg-[#EEF2FF]",
  },
];

function ExecutionMockup() {
  return (
    <div className="flex h-full">
      {/* Left sidebar — product iterations */}
      <div className="w-[240px] border-r border-[#E5E7EB] bg-white shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
              EXECUTION PLATFORM
            </span>
          </div>
          <h4 className="mt-1 text-[12px] font-semibold text-[#111111]">
            Vitamin C Serum
          </h4>
          <p className="text-[10px] text-[#9CA3AF]">
            North Beauty Co. · PO-2026-0418
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="px-3 py-2">
            <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] mb-2">
              ITERATIONS
            </p>
          </div>
          {ITERATIONS.map((item) => (
            <div
              key={item.label}
              className={`px-4 py-2.5 border-l-2 ${
                item.active
                  ? "border-l-[#4F46E5] bg-[#EEF2FF]/40"
                  : "border-l-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-[11px] font-semibold ${
                    item.active ? "text-[#111111]" : "text-[#6B7280]"
                  }`}
                >
                  {item.label}
                </p>
                <span className="text-[9px] font-medium text-[#9CA3AF] tabular-nums">
                  {item.version}
                </span>
              </div>
              <p
                className={`text-[9px] mt-0.5 ${
                  item.status === "Approved"
                    ? "text-[#10B981] font-semibold"
                    : item.status === "In revision"
                    ? "text-[#F59E0B] font-semibold"
                    : "text-[#9CA3AF]"
                }`}
              >
                {item.status}
              </p>
            </div>
          ))}
        </div>

        {/* Version summary */}
        <div className="border-t border-[#E5E7EB] px-4 py-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#9CA3AF]">Total revisions</span>
            <span className="font-semibold text-[#111827] tabular-nums">14</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-[#9CA3AF]">Samples shipped</span>
            <span className="font-semibold text-[#111827] tabular-nums">3</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-[#9CA3AF]">Pending approvals</span>
            <span className="font-semibold text-[#F59E0B] tabular-nums">2</span>
          </div>
        </div>
      </div>

      {/* Right — activity feed */}
      <div className="flex-1 bg-[#FAFAFA] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2} />
              <div>
                <p className="text-[13px] font-bold text-[#111111]">
                  Formulation v3.2
                </p>
                <p className="text-[10px] text-[#9CA3AF]">
                  Last updated 10m ago · 6 revisions
                </p>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full inline-flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5" strokeWidth={2.5} />
              IN REVISION
            </span>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="flex-1 overflow-hidden px-5 py-4">
          <p className="text-[8px] font-semibold tracking-wider text-[#9CA3AF] mb-3">
            ACTIVITY
          </p>
          <div className="space-y-3">
            {ACTIVITY_FEED.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${item.color}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#374151] leading-[1.5]">
                      <span className="font-semibold text-[#111111]">
                        {item.actor}
                      </span>{" "}
                      {item.action}
                    </p>
                    <p className="text-[9px] text-[#9CA3AF] mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action bar */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button className="bg-white border border-[#E5E7EB] text-[#111111] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 hover:bg-[#F9FAFB] transition-colors">
            <TestTube className="w-3 h-3" strokeWidth={2.5} />
            Request Sample
          </button>
          <button className="bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
            <ClipboardCheck className="w-3 h-3" strokeWidth={2.5} />
            Approve Revision
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup 6 — Convert quotes to orders (Client Portal)
   ───────────────────────────────────────────────────────────────── */

const CLIENT_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: FileCheck, label: "Live requests", active: true },
  { icon: Package, label: "Orders", active: false },
  { icon: FolderOpen, label: "Documents", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const APPROVAL_ROWS = [
  { label: "Ingredient list", status: "approved" as const },
  { label: "Packaging spec", status: "approved" as const },
  { label: "Product label", status: "approved" as const },
  { label: "Target market", status: "open" as const },
  { label: "Place of delivery", status: "pending" as const },
];

function OrdersMockup() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[150px] bg-[#111827] shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[11px] font-semibold text-white">ScaleCPG</p>
          <p className="text-[8px] text-[#6B7280]">Client Portal</p>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {CLIENT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] ${
                  item.active
                    ? "bg-white/[0.08] text-white font-medium"
                    : "text-[#6B7280]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                {item.label}
              </div>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#4F46E5]/20">
            <Sparkles className="w-3 h-3 text-[#818CF8]" strokeWidth={2.5} />
            <span className="text-[9px] font-semibold text-[#818CF8]">
              Convert AI
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#FAFAFA] flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="h-10 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-4 shrink-0">
          <p className="text-[12px] font-semibold text-[#111827]">
            Live Requests
          </p>
          <span className="text-[10px] text-[#9CA3AF]">1 active request</span>
        </div>

        {/* Request card + approvals */}
        <div className="flex-1 overflow-hidden p-4">
          {/* Request header card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 mb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-bold text-[#111111]">
                  Lavender facial cream
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  #FC-2847 · NovaChem Manufacturing
                </p>
              </div>
              <span className="text-[9px] font-semibold text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full">
                IN PROGRESS
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#10B981]"
                  style={{ width: "60%" }}
                />
              </div>
              <span className="text-[9px] font-semibold text-[#6B7280] tabular-nums">
                3/5
              </span>
            </div>
          </div>

          {/* Approval rows */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {APPROVAL_ROWS.map((row, idx) => (
              <div
                key={row.label}
                className={`${idx !== 0 ? "border-t border-[#F3F4F6]" : ""}`}
              >
                {/* Row header */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    {row.status === "approved" ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center">
                        <Check
                          className="w-2.5 h-2.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    ) : row.status === "open" ? (
                      <div className="w-4 h-4 rounded-full bg-[#4F46E5] flex items-center justify-center">
                        <ChevronRight
                          className="w-2.5 h-2.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D1D5DB]" />
                    )}
                    <span
                      className={`text-[11px] font-medium ${
                        row.status === "open"
                          ? "text-[#111111] font-semibold"
                          : "text-[#374151]"
                      }`}
                    >
                      {row.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-semibold ${
                      row.status === "approved"
                        ? "text-[#10B981]"
                        : row.status === "open"
                        ? "text-[#4F46E5]"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {row.status === "approved"
                      ? "Approved"
                      : row.status === "open"
                      ? "Review required"
                      : "Pending"}
                  </span>
                </div>

                {/* Expanded content for "Target market" */}
                {row.status === "open" && (
                  <div className="px-3.5 pb-3 pt-0">
                    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 ml-6">
                      {/* Copilot suggestion */}
                      <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[10px] text-[#374151] leading-[1.5]">
                          <span className="font-semibold text-[#4F46E5]">Convert Copilot:</span>{" "}
                          Amazon requires a barcode for each SKU. Please create the product listing on Amazon and download the barcode.
                        </p>
                      </div>

                      {/* Selected marketplace */}
                      <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-1.5">
                        SALES CHANNELS
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#111111] text-white text-[10px] font-semibold">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          Walmart
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#111111] text-white text-[10px] font-semibold">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          Amazon
                        </span>
                        <span className="px-2 py-1 rounded-md bg-white border border-[#E5E7EB] text-[10px] text-[#9CA3AF]">
                          + Add channel
                        </span>
                      </div>

                      {/* Barcode upload */}
                      <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-1.5">
                        AMAZON BARCODE
                      </p>
                      <label className="flex flex-col items-center justify-center py-3 border border-dashed border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4F46E5] transition-colors bg-white">
                        <Upload className="w-4 h-4 text-[#9CA3AF] mb-1" strokeWidth={2} />
                        <span className="text-[9px] text-[#6B7280]">Upload barcode file</span>
                        <span className="text-[8px] text-[#9CA3AF] mt-0.5">PNG, PDF, or SVG</span>
                      </label>

                      <div className="flex items-center gap-2 mt-3">
                        <button className="bg-[#4F46E5] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                          Confirm markets
                        </button>
                        <button className="bg-white border border-[#E5E7EB] text-[#6B7280] text-[10px] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" strokeWidth={2.5} />
                          Request changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
