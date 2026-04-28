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
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3">
              <span className="mr-2 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                AMM
              </span>
              <NavLinks menu={menu} />
            </nav>
          </header>
          <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
