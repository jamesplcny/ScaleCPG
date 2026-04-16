"use client";

import { useState } from "react";
import {
  Bot,
  Inbox,
  Send,
  ChevronDown,
  Clock,
  Sparkles,
} from "lucide-react";

type TabKey = "inbound" | "leads";

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
];

export function FeatureShowcase() {
  const [active, setActive] = useState<TabKey>("inbound");

  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">


      <div className="grid md:grid-cols-[300px_1fr] gap-6 md:gap-8">
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

          {/* Mockup body — fixed height to prevent reflow */}
          <div className="h-[540px] overflow-hidden">
            {active === "inbound" && <ChatWidgetMockup />}
            {active === "leads" && <LeadsMockup />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup A — Chat Widget (Automated inbound)
   ───────────────────────────────────────────────────────────────── */

function ChatWidgetMockup() {
  return (
    <div className="flex h-full">
      {/* Left panel — contact + progress */}
      <div className="hidden sm:flex flex-col w-[260px] border-r border-[#E5E7EB] bg-white p-5">
        <div>
          <h4 className="text-[15px] font-semibold text-[#111827]">Welcome!</h4>
          <p className="mt-1 text-[13px] font-medium text-[#374151]">
            Meridian Labs
          </p>
          <p className="text-[11px] text-[#9CA3AF]">Los Angeles, CA</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Formulation", "Private Label", "Fill & Finish"].map((s) => (
            <span
              key={s}
              className="text-[10px] font-medium px-2 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5]"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-[#6B7280] mb-1">
              Work Email
            </label>
            <div className="text-[12px] text-[#111827] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 bg-white">
              sarah@northbeauty.co
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#6B7280] mb-1">
              Contact Name
            </label>
            <div className="text-[12px] text-[#111827] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 bg-white">
              Sarah Chen
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock
              className="w-3 h-3 text-[#F59E0B]"
              strokeWidth={2.5}
            />
            <span className="text-[9px] font-semibold tracking-wider text-[#B45309]">
              INSTANT QUOTE VERIFICATION PENDING
            </span>
          </div>
          <div className="h-[5px] bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#86EFAC] to-[#FACC15]"
              style={{ width: "66.66%" }}
            />
          </div>
          <button className="mt-2.5 w-full inline-flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors">
            <span className="text-[10px] font-semibold text-[#374151]">
              View Qualifications
            </span>
            <span className="text-[10px] font-bold text-[#F59E0B] tabular-nums">
              4/6
            </span>
          </button>
        </div>

        <div className="mt-auto pt-5">
          <button className="w-full bg-[#4F46E5] text-white text-[12px] font-semibold py-2.5 rounded-lg">
            Submit Inquiry →
          </button>
        </div>
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 flex flex-col bg-[#F9FAFB] min-w-0">
        {/* Header */}
        <div className="h-11 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 shrink-0">
          <span className="text-[13px] font-semibold text-[#111827]">
            Meridian Labs
          </span>
          <span className="text-[10px] text-[#9CA3AF]">Powered by ScaleCPG</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden p-4 space-y-3">
          <AgentBubble>Hi! How can I help you today?</AgentBubble>
          <VisitorBubble>
            Looking for a manufacturer for a vitamin C serum, 10k units.
          </VisitorBubble>
          <AgentBubble>
            Great! Do you have an existing formula, or do you need us to develop
            one?
          </AgentBubble>
          <VisitorBubble>
            We have the formula. Need fill &amp; finish into 30ml dropper bottles.
          </VisitorBubble>
          <AgentBubble>Perfect — what&rsquo;s your target launch timeline?</AgentBubble>
        </div>

        {/* Input */}
        <div className="border-t border-[#E5E7EB] bg-white p-3 flex items-center gap-2 shrink-0">
          <div className="flex-1 text-[12px] text-[#9CA3AF] border border-[#E5E7EB] rounded-lg px-3 py-2">
            Type a message...
          </div>
          <button className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="max-w-[80%] bg-white border border-[#E5E7EB] text-[#374151] text-[12px] leading-[1.5] px-3 py-2 rounded-2xl rounded-tl-sm">
        {children}
      </div>
    </div>
  );
}

function VisitorBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[#4F46E5] text-white text-[12px] leading-[1.5] px-3 py-2 rounded-2xl rounded-tr-sm">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mockup B — Sales Leads (Qualified leads)
   ───────────────────────────────────────────────────────────────── */

const LEAD_LIST = [
  {
    initials: "SC",
    name: "Sarah Chen",
    company: "North Beauty Co.",
    summary: "Vitamin C serum, 10k units, formula in hand…",
    score: 87,
    when: "2h ago",
    selected: true,
  },
  {
    initials: "MR",
    name: "Marcus Reed",
    company: "Glow Standard",
    summary: "Retinol night cream, looking for full-service…",
    score: 79,
    when: "5h ago",
    selected: false,
  },
  {
    initials: "AP",
    name: "Aria Patel",
    company: "Lumen Skincare",
    summary: "Niacinamide toner, 25k units, Q4 launch…",
    score: 72,
    when: "Yesterday",
    selected: false,
  },
  {
    initials: "TJ",
    name: "Tomás Jiménez",
    company: "Casa Verde",
    summary: "Exploring options for organic lip balm line…",
    score: 54,
    when: "2d ago",
    selected: false,
  },
  {
    initials: "EK",
    name: "Eun Kim",
    company: "Petal & Powder",
    summary: "Just browsing, no clear product yet…",
    score: 31,
    when: "3d ago",
    selected: false,
  },
];

function scoreColor(score: number): string {
  if (score >= 65) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function LeadsMockup() {
  return (
    <div className="flex h-full">
      {/* Lead list */}
      <div className="w-[280px] border-r border-[#E5E7EB] bg-white overflow-hidden shrink-0">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <h4 className="text-[13px] font-semibold text-[#111111]">
            Sales Leads
          </h4>
          <p className="text-[10px] text-[#9CA3AF]">
            Sorted by score · 5 today
          </p>
        </div>
        <div>
          {LEAD_LIST.map((lead) => (
            <div
              key={lead.initials}
              className={`px-4 py-3 border-b border-[#F3F4F6] border-l-2 ${
                lead.selected
                  ? "border-l-[#4F46E5] bg-[#EEF2FF]/40"
                  : "border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center shrink-0">
                  {lead.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#111111] truncate">
                      {lead.name}
                    </span>
                    <span
                      className="text-[10px] font-bold shrink-0"
                      style={{ color: scoreColor(lead.score) }}
                    >
                      {lead.score}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    {lead.company}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] truncate mt-0.5">
                    {lead.summary}
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] mt-0.5">{lead.when}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead detail */}
      <div className="flex-1 bg-[#FAFAFA] overflow-hidden relative">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[#111111]">
                Sarah Chen
              </h3>
              <p className="text-[12px] text-[#6B7280]">North Beauty Co.</p>
              <p className="text-[11px] text-[#9CA3AF]">
                sarah@northbeauty.co
              </p>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-bold text-[#10B981] leading-none">
                87%
              </div>
              <p className="text-[10px] font-medium text-[#10B981] mt-0.5">
                High intent
              </p>
            </div>
          </div>

          {/* Lead data */}
          <div className="mt-4">
            <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-2">
              LEAD DATA
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-white border border-[#E5E7EB] rounded-lg p-3">
              {[
                ["Product", "Vitamin C serum"],
                ["Service", "Fill & Finish"],
                ["Volume", "10,000 units"],
                ["Timeline", "Q3 2026"],
                ["Packaging", "30ml dropper"],
                ["Formulation", "Complete"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-[10px] text-[#9CA3AF]">{k}</span>
                  <span className="text-[10px] font-medium text-[#111827] truncate">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI summary */}
          <div className="mt-3">
            <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-2">
              AI SUMMARY
            </p>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
              <p className="text-[11px] italic text-[#374151] leading-[1.5]">
                Sarah from North Beauty has a complete vitamin C serum formula
                and needs fill &amp; finish for 10k units into 30ml dropper
                bottles. Targeting Q3 launch. Strong fit for our standard
                fill-line capacity.
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div className="mt-3">
            <button className="flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5]">
              FULL TRANSCRIPT
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="mt-2 bg-white border border-[#E5E7EB] rounded-lg p-3 space-y-1.5">
              <p className="text-[10px]">
                <span className="font-semibold text-[#4F46E5]">Agent: </span>
                <span className="text-[#6B7280]">
                  Hi! How can I help you today?
                </span>
              </p>
              <p className="text-[10px]">
                <span className="font-semibold text-[#111827]">Sarah: </span>
                <span className="text-[#6B7280]">
                  Looking for a manufacturer for a vitamin C serum, 10k units.
                </span>
              </p>
              <p className="text-[10px]">
                <span className="font-semibold text-[#4F46E5]">Agent: </span>
                <span className="text-[#6B7280]">
                  Great! Do you have an existing formula, or need us to develop
                  one?
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button className="bg-white border border-[#E5E7EB] text-[#111111] text-[11px] font-semibold px-3.5 py-2 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#F9FAFB] transition-colors">
            Respond
          </button>
          <button className="bg-[#4F46E5] text-white text-[11px] font-semibold px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(79,70,229,0.25)] inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" strokeWidth={2.5} />
            Send to Convert
          </button>
        </div>
      </div>
    </div>
  );
}


