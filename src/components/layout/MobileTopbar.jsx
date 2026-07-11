"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/penjualan": "Penjualan",
  "/pembelian": "Pembelian",
  "/biaya": "Biaya",
  "/laporan": "Laporan",
  "/stok": "Stok",
};

function resolveTitle(pathname) {
  if (!pathname) return "OOS SHOP";
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return "OOS SHOP";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MobileTopbar({ onOpen }) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  const showBrand = title === "OOS SHOP";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-hairline/50 bg-surface-bone/95 backdrop-blur-sm px-4 py-4 lg:hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => onOpen?.()}
        aria-label="Buka menu navigasi"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink transition-all duration-200 hover:bg-primary/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-on-primary shadow-sm">
          O
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink">
            {title}
          </div>
        </div>
      </div>

      <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/5 backdrop-blur-sm" />
    </header>
  );
}
