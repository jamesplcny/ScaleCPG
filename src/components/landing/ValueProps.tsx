import { Search, Zap, Layers } from "lucide-react";

const CARDS = [
  {
    icon: Search,
    title: "Reduce friction, Increase Conversion",
    tag: "CRO",
    description:
      "People want answers quickly and benefit from recommendations. Contact forms create friction, emails get lost, and phone calls waste time when you have to sort through non-serious buyers.",
  },
  {
    icon: Zap,
    title: "Standardize pricing, Close deals faster",
    tag: null,
    description:
      "Remove guesswork and inconsistency from quoting with automated pricing logic that keeps every quote accurate, fast, and ready to convert.",
  },
  {
    icon: Layers,
    title: "Centralize the back-and-forth",
    tag: null,
    description:
      "We provide an execution platform with two-way production visibility. Handle everything from sample requests to full product approval. Win the client, keep the client.",
  },
];

export function ValueProps() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 pb-24 md:pb-28">
      <div className="grid md:grid-cols-3 gap-6">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#4F46E5]" strokeWidth={2} />
              </div>
              <h3 className="text-[16px] font-bold text-[#111111] leading-snug">
                {card.title}
                {card.tag && (
                  <span className="ml-2 text-[10px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full align-middle">
                    {card.tag}
                  </span>
                )}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#6B7280]">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
