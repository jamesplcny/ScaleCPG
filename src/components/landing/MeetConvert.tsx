import {
  Zap,
  Sparkles,
  Calculator,
  TrendingUp,
  Lightbulb,
  FileText,
  Target,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calculator,
    title: "Builds pricing from product specs",
    body: "Pulls Scout\u2019s structured spec and prices every line automatically.",
  },
  {
    icon: TrendingUp,
    title: "Calculates margins in real-time",
    body: "See landed cost, margin %, and profit dollars the moment a lead arrives.",
  },
  {
    icon: Lightbulb,
    title: "Suggests cost optimizations",
    body: "Surfaces ingredient swaps, MOQ thresholds, and bundling opportunities.",
  },
  {
    icon: Target,
    title: "Hits your target margin every time",
    body: "Set the floor — Convert reverses the math so quotes never under-price.",
  },
  {
    icon: FileText,
    title: "Generates ready-to-send quotes",
    body: "Branded RFQ documents land in your dashboard, one click from sent.",
  },
];

const COMPARISONS = [
  {
    label: "QUOTE TURNAROUND",
    before: "3–5 business days",
    after: "Under 5 minutes",
  },
  {
    label: "PRICING ACCURACY",
    before: "Spreadsheet guesswork",
    after: "Spec-driven math",
  },
  {
    label: "MARGIN VISIBILITY",
    before: "Calculated after the fact",
    after: "Live on every quote",
  },
  {
    label: "COST OPTIMIZATION",
    before: "Left on the table",
    after: "Suggested automatically",
  },
  {
    label: "QUOTE CONSISTENCY",
    before: "Varies by sales rep",
    after: "Standardized every time",
  },
];

export function MeetConvert() {
  return (
    <section id="meet-convert" className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28 scroll-mt-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* ── Left — Meet Convert ── */}
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] mb-5">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold tracking-wider text-[#4F46E5]">
              Instant quotations
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
              <Zap
                className="relative w-5 h-5 text-[#818CF8]"
                strokeWidth={2.5}
              />
            </div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[#111111]">
              Meet Convert.
            </h2>
          </div>

          <p className="text-[17px] leading-[1.65] text-[#6B7280] mb-3">
            Convert is your AI quote engine. It turns Scout&rsquo;s qualified specs
            into priced RFQs — building costs, calculating margins, and surfacing
            optimizations the moment a lead is ready.
          </p>
          <p className="text-[15px] leading-[1.65] text-[#9CA3AF] mb-7">
            Convert turns qualified demand into revenue in minutes, not days — so
            your team spends time closing deals instead of pricing them.
          </p>

          <ul className="space-y-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-md bg-[#EEF2FF] flex items-center justify-center mt-0.5">
                    <Icon
                      className="w-3.5 h-3.5 text-[#4F46E5]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#111111] leading-snug">
                      {f.title}
                    </p>
                    <p className="text-[13px] text-[#6B7280] leading-snug mt-0.5">
                      {f.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Right — Before / After ── */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3 px-1">
            <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF]">
              WITHOUT CONVERT
            </p>
            <p className="text-[10px] font-semibold tracking-wider text-[#4F46E5]">
              WITH CONVERT
            </p>
          </div>

          <div className="space-y-3">
            {COMPARISONS.map((c) => (
              <div
                key={c.label}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <p className="text-[9px] font-semibold tracking-wider text-[#9CA3AF] mb-2">
                  {c.label}
                </p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  {/* Before */}
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2.5">
                    <p className="text-[13px] text-[#9CA3AF] line-through decoration-[#EF4444]/40 decoration-1">
                      {c.before}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                    <ArrowRight
                      className="w-3 h-3 text-[#4F46E5]"
                      strokeWidth={2.5}
                    />
                  </div>

                  {/* After */}
                  <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg px-3 py-2.5">
                    <p className="text-[13px] font-semibold text-[#4F46E5]">
                      {c.after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
