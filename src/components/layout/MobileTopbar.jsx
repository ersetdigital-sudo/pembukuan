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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-surface-bone px-4 py-3 lg:hidden">
      <button
        type="button"
        onClick={() => onOpen?.()}
        aria-label="Buka menu navigasi"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink transition-colors hover:bg-hairline active:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-primary text-xs font-bold text-on-primary">
          O
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold text-ink">
            {title}
          </div>
        </div>
      </div>

      <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10" />
    </header>
  );
}
