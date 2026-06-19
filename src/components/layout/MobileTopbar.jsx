"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

// Map top-level route -> human title shown in the mobile topbar.
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
  // Fallback: strip leading slash, kebab-case -> Title Case
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return "OOS SHOP";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MobileTopbar({ onOpen }) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  const showBrand = title === "OOS SHOP";

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="Buka menu navigasi"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary font-display text-sm font-bold text-primary">
          O
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate font-display text-sm font-bold text-ink">
            {title}
          </div>
          {!showBrand && (
            <div className="truncate text-[10px] uppercase tracking-[0.2em] text-muted">
              OOS Shop · 2026
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
