import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  pending: "bg-accent-plum/12 text-accent-plum",
  approved: "bg-accent-sage/12 text-accent-sage",
  production: "bg-accent-rose/12 text-accent-rose",
  shipped: "bg-accent-sage/12 text-accent-sage",
  "in-stock": "bg-accent-sage/12 text-accent-sage",
  "in stock": "bg-accent-sage/12 text-accent-sage",
  "low-stock": "bg-accent-plum/12 text-accent-plum",
  "low stock": "bg-accent-plum/12 text-accent-plum",
  critical: "bg-accent-teal/12 text-accent-teal",
  "on-order": "bg-accent-rose/12 text-accent-rose",
  "on order": "bg-accent-rose/12 text-accent-rose",
  processing: "bg-accent-plum/12 text-accent-plum",
  confirmed: "bg-accent-sage/12 text-accent-sage",
  "pending qa": "bg-accent-plum/12 text-accent-plum",
  unread: "bg-accent-rose/12 text-accent-rose",
};

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const style = BADGE_STYLES[status.toLowerCase()] || "bg-bg-secondary text-text-secondary";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md uppercase tracking-wider",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
