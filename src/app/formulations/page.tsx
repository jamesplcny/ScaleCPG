import { TopBar } from "@/components/layout/TopBar";
import { BookOpen } from "lucide-react";

export default function FormulationsPage() {
  return (
    <>
      <TopBar title="Formulation Library" subtitle="Manage base formulas, ingredients, packaging, and add-on options." searchPlaceholder="Search formulas..." />

      <div className="flex items-center justify-center py-24">
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center max-w-md opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-14 h-14 rounded-xl bg-[rgba(107,158,158,0.1)] flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7" style={{ color: "#6B9E9E" }} strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-xl mb-2">Feature coming soon</h3>
          <p className="text-sm text-text-secondary leading-relaxed">Customize your own formulas from your favorite suppliers.</p>
        </div>
      </div>
    </>
  );
}
