import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ClientCardProps {
  client: { id: string; name: string; created_at: string };
  index?: number;
  actions?: React.ReactNode;
}

export function ClientCard({ client, index = 0, actions }: ClientCardProps) {
  const initials = client.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/clients/${client.id}`}
      className="group bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden no-underline text-inherit transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:shadow-hover hover:border-transparent block opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.05 + index * 0.05}s` }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-accent-rose to-accent-rose-light" />
      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-full border-2 border-border bg-bg-secondary flex items-center justify-center shrink-0 text-lg font-semibold text-text-secondary">
          {initials}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center transition-all duration-300 group-hover:bg-text-primary">
            <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" strokeWidth={2} />
          </div>
        </div>
      </div>
      <h4 className="font-semibold text-lg">{client.name}</h4>
    </Link>
  );
}
