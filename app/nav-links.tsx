"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MenuItem = { href: string; label: string };

export function NavLinks({ menu }: { menu: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {menu.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "border-white/70 bg-white/60 text-slate-700 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
