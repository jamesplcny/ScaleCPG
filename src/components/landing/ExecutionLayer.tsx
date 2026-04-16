import {
  CheckCircle2,
  Layers,
  Package,
  Factory,
  ChevronDown,
  TestTube,
  ClipboardCheck,
  GitBranch,
  RefreshCw,
} from "lucide-react";
import { GetStartedButton } from "@/components/GetStartedButton";

const FEATURES = [
  "Manages samples, revisions & approvals",
  "Tracks every product iteration",
  "Converts approved quotes into orders",
  "Keeps brands and manufacturers aligned",
];

export function ExecutionLayer() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pt-4 pb-24 md:pb-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
        {/* Left — copy */}
        <div className="text-left">
          <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold tracking-[-0.01em] text-[#6B7280] mb-3">
            Two-way production visibility
          </p>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-[#111111]">
            From quote to production.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.65] text-[#6B7280]">
            Once a quote is accepted, the real work begins. ScaleCPG&rsquo;s
            execution layer manages samples, revisions, and approvals — and
            tracks every product iteration in one place.
          </p>
          <p className="mt-3 text-[15px] leading-[1.65] text-[#9CA3AF]">
            Convert approved quotes into orders. Keep brands and manufacturers
            aligned without the email chaos. Everything that happens after
            &ldquo;yes&rdquo; — finally structured.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 text-[14px] text-[#6B7280]">
            {FEATURES.map((point) => (
              <span key={point} className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#4F46E5] shrink-0"
                  strokeWidth={2}
                />
                {point}
              </span>
            ))}
          </div>

          <div className="mt-9">
            <GetStartedButton className="inline-flex items-center px-6 py-3 bg-[#111111] text-white text-[15px] font-medium rounded-xl transition-colors hover:bg-[#000000] cursor-pointer">
              Book a Call
            </GetStartedButton>
          </div>
        </div>

        {/* Right — execution flow */}
        <ExecutionFlow />
      </div>
    </section>
  );
}

function ExecutionFlow() {
  return (
    <div className="w-full">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-5 md:p-6">
        {/* 1 — Quote Accepted */}
        <FlowNode delay={0}>
          <div className="bg-[#ECFDF5] border border-[#10B981]/30 rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-[#10B981] shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-semibold tracking-wider text-[#047857]">
                  QUOTE ACCEPTED
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#047857] shrink-0">
                Signed
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[16px] font-bold text-[#111111] tabular-nums">
                $48,200
              </span>
              <span className="text-[11px] text-[#6B7280]">
                · North Beauty Co.
              </span>
            </div>
          </div>
        </FlowNode>

        <Connector delay={40} />

        {/* 2 — Execution Layer (centerpiece) */}
        <FlowNode delay={80}>
          <div className="relative bg-[#111111] rounded-xl p-4 overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#4F46E5]/20 flex items-center justify-center shrink-0">
                  <Layers
                    className="w-3.5 h-3.5 text-[#818CF8]"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white leading-none">
                    Execution Layer
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                    ScaleCPG Platform
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
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
                    <Icon
                      className="w-3 h-3 text-[#818CF8] shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="text-[10px] font-medium text-[#E5E7EB]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FlowNode>

        <Connector delay={120} />

        {/* 3 — Order Created */}
        <FlowNode delay={160}>
          <div className="bg-[#EEF2FF] border border-[#4F46E5]/30 rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Package
                  className="w-3.5 h-3.5 text-[#4F46E5] shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-[9px] font-semibold tracking-wider text-[#4F46E5]">
                  ORDER CREATED
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#4F46E5] shrink-0 tabular-nums">
                PO-2026-0418
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6B7280]">
              Confirmed · 10,000 units · Q3 2026
            </p>
          </div>
        </FlowNode>

        <Connector delay={200} />

        {/* 4 — In Production */}
        <FlowNode delay={240}>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Factory
                  className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0"
                  strokeWidth={2}
                />
                <span className="text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
                  IN PRODUCTION
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#10B981] shrink-0 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live sync
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6B7280]">
              Status updated 2h ago · On schedule
            </p>
          </div>
        </FlowNode>
      </div>

      <p className="mt-5 text-center text-[13px] font-semibold text-[#6B7280]">
        From inquiry to production — all in one system.
      </p>
    </div>
  );
}

function FlowNode({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Connector({ delay }: { delay: number }) {
  return (
    <div
      className="flex flex-col items-center py-1 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-px h-2 bg-[#E5E7EB]" />
      <ChevronDown
        className="w-3 h-3 text-[#9CA3AF] -my-0.5"
        strokeWidth={2.5}
      />
      <div className="w-px h-2 bg-[#E5E7EB]" />
    </div>
  );
}
