"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const CHANNEL_OPTIONS = [
  "DTC Website",
  "Amazon",
  "Retail (Target, Walmart, etc.)",
  "Specialty / Boutique",
  "Wholesale / Distributor",
  "Subscription Box",
  "Salon / Spa",
  "International",
];

interface SalesChannelsSelectProps {
  value: string[];
  onChange: (channels: string[]) => void;
}

export function SalesChannelsSelect({ value, onChange }: SalesChannelsSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(channel: string) {
    if (value.includes(channel)) {
      onChange(value.filter((c) => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  }

  function remove(channel: string) {
    onChange(value.filter((c) => c !== channel));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm font-sans text-text-primary outline-none transition-colors focus:border-accent-rose flex items-center justify-between cursor-pointer text-left"
      >
        <span className={value.length === 0 ? "text-text-muted" : ""}>
          {value.length === 0 ? "Select channels..." : `${value.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-bg-card border border-border rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto">
          {CHANNEL_OPTIONS.map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() => toggle(channel)}
              className={`w-full px-4 py-2 text-sm text-left font-sans border-none cursor-pointer transition-colors ${
                value.includes(channel)
                  ? "bg-accent-rose/10 text-accent-rose"
                  : "bg-transparent text-text-primary hover:bg-bg-secondary"
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((channel) => (
            <span
              key={channel}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-rose/10 text-accent-rose text-xs rounded-full font-sans"
            >
              {channel}
              <button
                type="button"
                onClick={() => remove(channel)}
                className="p-0 border-none bg-transparent cursor-pointer text-accent-rose/60 hover:text-accent-rose"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
