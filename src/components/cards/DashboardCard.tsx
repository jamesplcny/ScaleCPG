import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  accentFrom: string;
  accentTo: string;
  index?: number;
}

export function DashboardCard({
  title,
  description,
  href,
  icon: Icon,
  iconColor,
  iconBg,
  accentFrom,
  accentTo,
  index = 0,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="group bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden no-underline text-inherit transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:shadow-hover hover:border-transparent opacity-0 animate-fade-in-up block"
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
      />
      <div className="flex items-start justify-between mb-6">
        <div
          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-[26px] h-[26px]" style={{ color: iconColor }} strokeWidth={1.5} />
        </div>
        <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center transition-all duration-300 group-hover:bg-text-primary">
          <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" strokeWidth={2} />
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
      <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
    </Link>
  );
}
