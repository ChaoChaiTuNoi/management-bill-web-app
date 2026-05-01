import type { Metadata } from "next";
import "./globals.css";
import { NavLinks } from "./nav-links";

export const metadata: Metadata = {
  title: "ระบบบัญชี",
  description: "ระบบบัญชีโรงงาน ร้านค้า ภาษี และแดชบอร์ด"
};

const menu = [
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/factory-bills", label: "บิลโรงงาน" },
  { href: "/store", label: "รายการร้านค้า" },
  { href: "/tax", label: "ภาษี" },
  { href: "/master-data", label: "ข้อมูลหลัก" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent" />
          <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-x-auto px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  AMM
                </span>
                <p className="hidden text-sm font-medium text-slate-600 sm:block">Account Money Management</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 sm:inline-flex">
                  Commercial UI
                </span>
              </div>
            </nav>
            <nav className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 pb-3">
              <NavLinks menu={menu} />
            </nav>
          </header>
          <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
