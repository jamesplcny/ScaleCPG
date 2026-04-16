import {
  Search,
  Zap,
  Hammer,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const PHASES = [
  {
    icon: Search,
    iconBg: "bg-[#4F46E5]/20",
    iconColor: "text-[#818CF8]",
    title: "AI Scout",
    role: "Inbound",
    steps: [
      "Chat opens on your website",
      "Catalog + spec retrieval",
      "Guided Q&A",
    ],
    branch: {
      yes: "Qualified → Instant quote",
      no: "Not yet → Summary to dashboard",
    },
  },
  {
    icon: Hammer,
    iconBg: "bg-[#F59E0B]/20",
    iconColor: "text-[#FBBF24]",
    title: "AI Forge",
    role: "Gap Analysis",
    steps: [
      "Fills missing specs",
      "Estimates costs",
      "Drafts quote for review",
      "Sends quote → Invites client to portal",
    ],
    branch: null,
  },
  {
    icon: Zap,
    iconBg: "bg-[#4F46E5]/20",
    iconColor: "text-[#818CF8]",
    title: "AI Convert",
    role: "Execution",
    steps: [
      "Quote Approved = Order details unlocked",
      "Spec Confirmation",
      "Samples + Version Control",
      "Generate Purchase Order → Production",
    ],
    branch: null,
  },
];

export function HeroFlow() {
  return (
    <div className="w-full">
      <div
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="relative bg-[#111111] rounded-3xl p-5 md:p-6 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[15px] font-bold text-white tracking-[-0.01em]">
                  ScaleCPG
                </p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">
                  AI-Powered Pipeline
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[9px] font-semibold text-[#10B981]">
                  Fully automated
                </span>
              </div>
            </div>

            {/* Phases */}
            <div className="space-y-3">
              {PHASES.map((phase, idx) => {
                const Icon = phase.icon;
                return (
                  <div
                    key={phase.title}
                    className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5"
                  >
                    {/* Phase header */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-6 h-6 rounded-md ${phase.iconBg} flex items-center justify-center shrink-0`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 ${phase.iconColor}`}
                          strokeWidth={2.5}
                        />
                      </div>
                      <p className="text-[12px] font-semibold text-white">
                        {phase.title}
                        <span className="text-[#6B7280] font-normal ml-1.5">
                          — {phase.role}
                        </span>
                      </p>
                    </div>

                    {/* Step chain */}
                    <div className="pl-[34px]">
                      <p className="text-[10px] text-[#9CA3AF] leading-[1.7]">
                        {phase.steps.map((step, i) => (
                          <span key={i}>
                            {step}
                            {i < phase.steps.length - 1 && (
                              <span className="text-[#4F46E5] mx-1">→</span>
                            )}
                          </span>
                        ))}
                      </p>

                      {/* Branch (Scout only) */}
                      {phase.branch && (
                        <div className="mt-1.5 flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-[10px]">
                            <CheckCircle2
                              className="w-3 h-3 text-[#10B981] shrink-0"
                              strokeWidth={2.5}
                            />
                            <span className="text-[#10B981] font-medium">
                              {phase.branch.yes}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[10px]">
                            <AlertCircle
                              className="w-3 h-3 text-[#F59E0B] shrink-0"
                              strokeWidth={2.5}
                            />
                            <span className="text-[#F59E0B] font-medium">
                              {phase.branch.no}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[13px] font-semibold text-[#6B7280]">
        Full Sales Cycle - Automated and Organized.
      </p>
    </div>
  );
}
