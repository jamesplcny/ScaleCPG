"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { NAV_ITEMS, BRAND_NAV_ITEMS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PORTAL_CONFIG = {
  manufacturer: { navItems: NAV_ITEMS, subtitle: "Manufacturing Suite" },
  brand: { navItems: BRAND_NAV_ITEMS, subtitle: "Brand Portal" },
} as const;

interface SidebarProps {
  portal?: "manufacturer" | "brand";
}

export function Sidebar({ portal = "manufacturer" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { navItems, subtitle } = PORTAL_CONFIG[portal];

  const isActive = (href: string) => {
    if (href === navItems[0]?.href) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E5E7EB] py-8 flex flex-col z-50 transition-transform duration-300 max-lg:-translate-x-full">
      <div className="px-7 mb-10">
        <h1 className="font-semibold text-lg tracking-tight text-text-primary">
          ScaleCPG
        </h1>
        <span className="block text-[11px] text-text-muted mt-1">
          {subtitle}
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 relative no-underline",
                active
                  ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-text-primary"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}

      </nav>

      <div className="pt-5 border-t border-[#E5E7EB] mx-3 mt-0 flex flex-col gap-1 px-1">
        <Link
          href={portal === "brand" ? "/brand/profile" : "/profile"}
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 no-underline",
            pathname.startsWith(portal === "brand" ? "/brand/profile" : "/profile")
              ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
              : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-text-primary"
          )}
        >
          <User className="w-5 h-5 shrink-0" />
          My Profile
        </Link>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer border-none bg-transparent text-[#6B7280] text-sm font-medium transition-colors hover:bg-[#F3F4F6] hover:text-text-primary w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
