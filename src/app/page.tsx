import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Package,
  Truck,
  ShieldCheck,
  Zap,
  BarChart3,
  ChevronDown,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Custom Formulations & SKUs",
    description:
      "Work directly with manufacturers to develop custom formulations, select packaging, and build your product catalog — all within one workflow.",
  },
  {
    icon: Package,
    title: "Ordering & Fulfillment",
    description:
      "Submit orders, track production status, and manage shipments from a single dashboard. No more spreadsheets or email threads.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Manufacturer Network",
    description:
      "Every manufacturer on ScaleCPG is vetted for GMP compliance, certifications, capacity, and quality standards.",
  },
  {
    icon: BarChart3,
    title: "Full Supply Chain Visibility",
    description:
      "Real-time visibility into inventory, orders, clients, and production — for both brands and manufacturers.",
  },
];

const PAIN_POINTS = [
  "Searching for manufacturers through outdated directories and cold outreach",
  "Managing formulations, pricing, and orders over email and spreadsheets",
  "No visibility into production timelines, inventory, or shipment status",
  "Fragmented workflows across sourcing, customization, ordering, and logistics",
];

const FAQS = [
  {
    q: "What types of products does ScaleCPG support?",
    a: "We focus on cosmetics, skincare, haircare, and personal care — including private-label, white-label, and custom formulations.",
  },
  {
    q: "How are manufacturers vetted?",
    a: "Every manufacturer goes through a verification process covering FDA compliance, GMP certifications, insurance, and production capacity.",
  },
  {
    q: "Is there a minimum order size?",
    a: "MOQs vary by manufacturer. Our platform lets you filter by MOQ so you can find partners that match your volume, from small-batch to large-scale.",
  },
  {
    q: "How much does ScaleCPG cost?",
    a: "ScaleCPG is free to join for both brands and manufacturers during our early access period. We'll introduce transparent, usage-based pricing as the platform grows.",
  },
  {
    q: "Can I manage existing manufacturer relationships here?",
    a: "Yes. Manufacturers can invite their existing brand clients to the portal, giving both sides better visibility into orders and production.",
  },
];

const inter = "font-[family-name:var(--font-inter)]";

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#111111] ${inter}`}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-lg border-b border-[#E5E7EB]">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[-0.01em] text-[#111111] no-underline"
          >
            ScaleCPG
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[14px] text-[#6B7280]">
            <a href="#features" className="hover:text-[#111111] transition-colors no-underline">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#111111] transition-colors no-underline">
              How It Works
            </a>
            <a href="#faq" className="hover:text-[#111111] transition-colors no-underline">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-[14px] font-medium text-[#6B7280] hover:text-[#111111] transition-colors no-underline"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-[#4F46E5] text-white text-[14px] font-medium rounded-lg transition-colors hover:bg-[#4338CA] no-underline"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[1120px] mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-[680px] mx-auto text-center">
          <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-[#111111]">
            The Supply Chain Platform for Beauty Brands
          </h1>
          <p className="mt-6 text-[18px] leading-[1.7] text-[#6B7280] max-w-[560px] mx-auto">
            Connect directly with verified manufacturers to formulate, customize,
            and order products — all in one seamless platform.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-[14px] text-[#6B7280]">
            {[
              "Direct access to contract manufacturers",
              "Custom formulations & SKUs",
              "Ordering & fulfillment built in",
            ].map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" strokeWidth={2} />
                {point}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white text-[15px] font-medium rounded-xl transition-colors hover:bg-[#4338CA] no-underline"
            >
              Start as a Brand
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#111111] text-[15px] font-medium rounded-xl border border-[#E5E7EB] transition-colors hover:bg-[#F3F4F6] no-underline"
            >
              Join as a Manufacturer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-20 max-w-[900px] mx-auto">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
              <span className="ml-3 text-[11px] text-[#9CA3AF] font-medium tracking-wide">
                ScaleCPG Dashboard
              </span>
            </div>
            <div className="flex">
              {/* Mini sidebar */}
              <div className="hidden sm:flex flex-col gap-1.5 w-40 border-r border-[#E5E7EB] p-4 bg-[#FAFAFA]">
                {["Dashboard", "Clients", "Orders", "Products", "Inventory"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className={`px-3 py-2 rounded-lg text-[12px] font-medium ${
                        i === 0
                          ? "bg-[#4F46E5]/8 text-[#4F46E5]"
                          : "text-[#9CA3AF]"
                      }`}
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
              {/* Main content area */}
              <div className="flex-1 p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Orders", value: "24" },
                    { label: "Clients", value: "12" },
                    { label: "Revenue", value: "$84.2k" },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4"
                    >
                      <div className="text-[18px] font-semibold text-[#111111] tracking-[-0.01em]">
                        {card.value}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-0.5">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-20 bg-[#E5E7EB] rounded-full" />
                      <div className="h-2 flex-1 bg-[#F3F4F6] rounded-full" />
                      <div className="h-2 w-14 bg-[#E5E7EB] rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-24 md:py-28">
          <div className="max-w-[640px] mx-auto text-center mb-14">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5] mb-4">
              The Problem
            </p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[#111111]">
              Beauty supply chains are still run on emails, spreadsheets, and guesswork
            </h2>
          </div>
          <div className="max-w-[560px] mx-auto space-y-4">
            {PAIN_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3.5 px-5 py-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <span className="block w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                </div>
                <p className="text-[14px] text-[#374151] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-[#E5E7EB]">
        <div className="max-w-[1120px] mx-auto px-6 py-24 md:py-28">
          <div className="max-w-[640px] mx-auto text-center mb-14">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5] mb-4">
              Platform
            </p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[#111111]">
              Everything you need to source, build, and scale
            </h2>
            <p className="mt-4 text-[16px] text-[#6B7280] leading-relaxed">
              ScaleCPG replaces the fragmented stack of tools, directories, and manual
              processes with one vertically integrated platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-[880px] mx-auto">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-7 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#4F46E5]" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#111111] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-24 md:py-28">
          <div className="max-w-[640px] mx-auto text-center mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5] mb-4">
              How It Works
            </p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[#111111]">
              Simple for both sides of the supply chain
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-[880px] mx-auto">
            {/* Brands */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5] mb-8">
                For Brands
              </h3>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Browse Manufacturers",
                    desc: "Search verified manufacturers by category, MOQ, certifications, and lead time.",
                  },
                  {
                    step: "02",
                    title: "Request & Customize",
                    desc: "Submit formulation specs, select packaging, choose accessories, and request quotes directly.",
                  },
                  {
                    step: "03",
                    title: "Order & Track",
                    desc: "Place orders, manage your product catalog, and monitor fulfillment from one dashboard.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <span className="text-[13px] font-semibold text-[#4F46E5]">{s.step}</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#111111]">{s.title}</h4>
                      <p className="text-[14px] text-[#6B7280] mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturers */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#111111] mb-8">
                For Manufacturers
              </h3>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "List Your Capabilities",
                    desc: "Showcase formulations, MOQs, certifications, and production capacity to qualified brands.",
                  },
                  {
                    step: "02",
                    title: "Receive Brand Requests",
                    desc: "Get quote requests from brands looking for exactly what you produce. Review and respond directly.",
                  },
                  {
                    step: "03",
                    title: "Manage & Scale",
                    desc: "Track orders, inventory, and client relationships from one centralized dashboard.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                      <span className="text-[13px] font-semibold text-[#374151]">{s.step}</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#111111]">{s.title}</h4>
                      <p className="text-[14px] text-[#6B7280] mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Credibility / Network ── */}
      <section className="border-t border-[#E5E7EB]">
        <div className="max-w-[1120px] mx-auto px-6 py-24 md:py-28">
          <div className="max-w-[800px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EEF2FF] rounded-full mb-8">
              <Zap className="w-4 h-4 text-[#4F46E5]" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-[#4F46E5]">Early Access</span>
            </div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[#111111]">
              Built for the next generation of beauty brands
            </h2>
            <p className="mt-5 text-[16px] text-[#6B7280] leading-relaxed max-w-[560px] mx-auto">
              Whether you are launching your first SKU or scaling to thousands of
              units, ScaleCPG gives you direct access to verified, production-ready
              contract manufacturers — without the runaround.
            </p>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "100%", label: "Verified Manufacturers" },
                { value: "10x", label: "Faster Sourcing" },
                { value: "1", label: "Unified Platform" },
                { value: "0", label: "Spreadsheets Needed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-[28px] font-bold text-[#111111] tracking-[-0.02em]">
                    {stat.value}
                  </div>
                  <div className="text-[13px] text-[#9CA3AF] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-[#E5E7EB] bg-[#111111]">
        <div className="max-w-[1120px] mx-auto px-6 py-24 md:py-28 text-center">
          <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
            Ready to modernize your supply chain?
          </h2>
          <p className="mt-4 text-[16px] text-[#9CA3AF] leading-relaxed max-w-[480px] mx-auto">
            Join ScaleCPG today and connect with verified manufacturers — or list
            your manufacturing capabilities to reach new brands.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white text-[15px] font-medium rounded-xl transition-colors hover:bg-[#4338CA] no-underline"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-[#9CA3AF] text-[15px] font-medium rounded-xl border border-[#374151] transition-colors hover:text-white hover:border-[#6B7280] no-underline"
            >
              Join as a Manufacturer
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-[640px] mx-auto px-6 py-24 md:py-28">
          <div className="text-center mb-14">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.02em] text-[#111111]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-[14px] font-medium text-[#111111]">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0 ml-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-[14px] text-[#6B7280] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="max-w-[1120px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-semibold text-[#111111] tracking-[-0.01em]">
            ScaleCPG
          </span>
          <p className="text-[13px] text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} ScaleCPG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
