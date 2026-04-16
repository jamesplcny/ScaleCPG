import {
  Search,
  Sparkles,
  Inbox,
  ListChecks,
  Gauge,
  FileText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Inbox,
    title: "Parses every inbound inquiry",
    body: "Email, web form, or chat — Scout reads it the moment it lands.",
  },
  {
    icon: ListChecks,
    title: "Extracts product requirements",
    body: "Pulls product, volume, packaging, timeline & spec into structured fields.",
  },
  {
    icon: AlertCircle,
    title: "Flags missing information",
    body: "Asks the buyer follow-ups so reps never chase incomplete briefs.",
  },
  {
    icon: Gauge,
    title: "Scores intent in real-time",
    body: "Lead score updates as the conversation unfolds — no manual triage.",
  },
  {
    icon: FileText,
    title: "Generates clean lead summaries",
    body: "Drops a ready-to-action brief into your dashboard the second it qualifies.",
  },
];

const COMPARISONS = [
  {
    label: "RESPONSE TIME",
    before: "2–3 days",
    after: "Instant",
  },
  {
    label: "LEAD TRIAGE",
    before: "Hours of manual sorting",
    after: "Auto-scored & ranked",
  },
  {
    label: "INFO CAPTURE",
    before: "Endless email threads",
    after: "Captured in one chat",
  },
  {
    label: "LEAD QUALITY",
    before: "Time-wasters mixed in",
    after: "Only qualified RFQs",
  },
  {
    label: "SALES BANDWIDTH",
    before: "Reps drowning in inbound",
    after: "Reps focused on closing",
  },
];

export function MeetScout() {
  return (
    <section id="meet-scout" className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28 scroll-mt-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* ── Left — Meet Scout ── */}
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] mb-5">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" strokeWidth={2.5} />
            <span className="text-[10px] font-semibold tracking-wider text-[#4F46E5]">
              AI-powered lead capture
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
              <Search
                className="relative w-5 h-5 text-[#818CF8]"
                strokeWidth={2.5}
              />
            </div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[#111111]">
              Meet Scout.
            </h2>
          </div>

          <p className="text-[17px] leading-[1.65] text-[#6B7280] mb-3">
            Scout is your always-on intake agent. It parses every inbound request,
            extracts the product requirements that matter, flags what&rsquo;s missing,
            and qualifies the opportunity — instantly.
          </p>
          <p className="text-[15px] leading-[1.65] text-[#9CA3AF] mb-7">
            Scout turns messy inbound into structured, qualified opportunities so
            your team only ever sees deals worth their time.
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
              WITHOUT SCOUT
            </p>
            <p className="text-[10px] font-semibold tracking-wider text-[#4F46E5]">
              WITH SCOUT
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
