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
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
              isActive
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50 hover:text-black"
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
