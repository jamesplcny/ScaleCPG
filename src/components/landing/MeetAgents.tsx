import {
  Search,
  Hammer,
  Zap,
  Inbox,
  ListChecks,
  AlertCircle,
  Gauge,
  FileText,
  Lightbulb,
  TrendingUp,
  Sparkles,
  Target,
  Package,
  ClipboardCheck,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

const AGENTS = [
  {
    theme: "silver" as const,
    title: "Meet Scout.",
    icon: Search,
    iconBg: "bg-[#4F46E5]/10",
    iconColor: "text-[#4F46E5]",
    accentColor: "border-[#4F46E5]/20",
    pillBg: "bg-[#EEF2FF]",
    pillText: "text-[#4F46E5]",
    pillLabel: "Inbound AI Agent",
    description:
      "Scout handles every inbound inquiry through guided conversation, and delivers qualified leads to your team instantly.",
    features: [
      { icon: CheckCircle2, text: "Stop losing leads to slow response times — every inquiry is handled instantly, 24/7" },
      { icon: Target, text: "Let Scout turn low intent leads into high conviction orders" },
    ],
  },
  {
    theme: "dark" as const,
    title: "Meet Forge.",
    icon: Hammer,
    iconBg: "bg-[#F59E0B]/10",
    iconColor: "text-[#F59E0B]",
    accentColor: "border-[#F59E0B]/20",
    pillBg: "bg-[#FEF3C7]",
    pillText: "text-[#92400E]",
    pillLabel: "Gap Analysis AI",
    description:
      "Forge detects gaps in the inquiry, fills in missing specs, estimates costs, and drafts a quote — so your team reviews instead of builds from scratch.",
    features: [
      { icon: TrendingUp, text: "Send quotes in minutes instead of days — pricing is estimated and structured before your team even opens the lead" },
      { icon: Lightbulb, text: "Catch margin-killing gaps early — missing specs are flagged and filled so quotes are accurate the first time" },
    ],
  },
  {
    theme: "silver" as const,
    title: "Meet Convert.",
    icon: Zap,
    iconBg: "bg-[#4F46E5]/10",
    iconColor: "text-[#4F46E5]",
    accentColor: "border-[#4F46E5]/20",
    pillBg: "bg-[#EEF2FF]",
    pillText: "text-[#4F46E5]",
    pillLabel: "Execution AI Agent",
    description:
      "Once a quote is approved, Convert opens a client portal where every order detail gets locked in - collaboratively, with AI guidance at every step.",
    features: [
      { icon: Package, text: "Eliminate email chaos — samples, revisions, and approvals all happen in one place with full visibility for both sides" },
      { icon: ClipboardCheck, text: "Win the client and keep them — a structured post-sale experience builds trust and drives repeat orders" },
    ],
  },
];

export function MeetAgents() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">

      <div className="grid md:grid-cols-3 gap-8">
        <AgentCard agent={AGENTS[0]} />
        <AgentCard agent={AGENTS[1]} />
        <AgentCard agent={AGENTS[2]} />
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: (typeof AGENTS)[number] }) {
  const Icon = agent.icon;

  const isSilver = agent.theme === "silver";

  return (
    <div
      className={`relative rounded-2xl p-6 overflow-hidden ${
        isSilver
          ? "bg-[#F0F1F3] border border-[#D4D6DB] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          : "bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      }`}
    >
      {!isSilver && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      )}
      <div className="relative">
        {/* Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${agent.pillBg} mb-4`}
        >
          <Icon className={`w-3 h-3 ${agent.pillText}`} strokeWidth={2.5} />
          <span
            className={`text-[10px] font-semibold tracking-wider ${agent.pillText}`}
          >
            {agent.pillLabel}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl ${agent.iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-5 h-5 ${agent.iconColor}`} strokeWidth={2} />
          </div>
          <h3
            className={`text-[clamp(1.25rem,2.5vw,1.75rem)] font-bold leading-[1.1] tracking-[-0.02em] ${
              isSilver ? "text-[#111111]" : "text-white"
            }`}
          >
            {agent.title}
          </h3>
        </div>

        {/* Description */}
        <p
          className={`text-[15px] leading-[1.65] mb-5 ${
            isSilver ? "text-[#6B7280]" : "text-[#9CA3AF]"
          }`}
        >
          {agent.description}
        </p>

        {/* Feature list */}
        <ul className="space-y-2.5">
          {agent.features.map((f) => {
            const FIcon = f.icon;
            return (
              <li key={f.text} className="flex items-start gap-2.5">
                <div
                  className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 ${
                    isSilver ? "bg-white" : "bg-white/[0.06]"
                  }`}
                >
                  <FIcon
                    className={`w-3.5 h-3.5 ${agent.iconColor}`}
                    strokeWidth={2.5}
                  />
                </div>
                <p
                  className={`text-[13px] leading-snug ${
                    isSilver ? "text-[#374151]" : "text-[#D1D5DB]"
                  }`}
                >
                  {f.text}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
