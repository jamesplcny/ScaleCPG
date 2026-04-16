"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111827] py-8 flex flex-col z-50 max-lg:-translate-x-full transition-transform duration-300">
      <div className="px-6 mb-10">
        <h1 className="font-semibold text-lg tracking-tight text-white">
          ScaleCPG
        </h1>
        <span className="block text-[11px] text-gray-400 mt-1">
          Admin Console
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 no-underline ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-5 border-t border-white/10 mx-3 px-1">
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer border-none bg-transparent text-gray-400 text-sm transition-colors hover:bg-white/5 hover:text-gray-200 w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
