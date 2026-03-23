import { Search, Bell } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
}

export function TopBar({ title, subtitle, searchPlaceholder = "Search..." }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
      <div>
        <h2 className="font-semibold text-2xl text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-[10px] px-5 py-3 min-w-[240px] transition-all focus-within:border-accent-rose-light focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.15)] max-sm:min-w-full">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="border-none outline-none font-sans text-[13px] bg-transparent text-text-primary w-full placeholder:text-text-muted"
          />
        </div>
        <button className="w-10 h-10 rounded-[10px] border border-border bg-bg-card flex items-center justify-center cursor-pointer transition-all relative hover:border-accent-rose-light hover:shadow-sm">
          <Bell className="w-[18px] h-[18px] text-text-secondary" />
          <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-accent-rose rounded-full border-2 border-bg-card" />
        </button>
      </div>
    </div>
  );
}
