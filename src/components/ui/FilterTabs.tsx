"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterTabsProps {
  tabs: string[];
  paramKey?: string;
}

export function FilterTabs({ tabs, paramKey = "filter" }: FilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get(paramKey) || tabs[0];

  function handleClick(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === tabs[0]) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, tab);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex gap-1 mb-6 bg-bg-secondary rounded-[10px] p-1.5 w-fit max-sm:overflow-x-auto max-sm:w-full">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleClick(tab)}
          className={cn(
            "px-5 py-2.5 rounded-lg text-[13px] font-normal text-text-secondary cursor-pointer transition-all duration-200 border-none bg-transparent font-sans",
            (current === tab) && "bg-bg-card text-text-primary font-medium shadow-sm"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
