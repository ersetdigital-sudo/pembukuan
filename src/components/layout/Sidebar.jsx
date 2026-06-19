"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  ShoppingCart,
  FileBarChart,
  Boxes,
  ShoppingBag,
  Receipt,
  Wallet,
  Package,
} from "lucide-react";

const NAV = [
  {
    group: "Utama",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Transaksi",
    items: [
      { href: "/penjualan", label: "Penjualan", icon: ShoppingCart },
      { href: "/pembelian", label: "Pembelian", icon: ShoppingBag },
      { href: "/biaya", label: "Biaya", icon: Receipt },
    ],
  },
  {
    group: "Master",
    items: [
      { href: "/produk", label: "Produk", icon: Package },
    ],
  },
  {
    group: "Insights",
    items: [
      { href: "/laporan", label: "Laporan", icon: FileBarChart },
      { href: "/stok", label: "Stok", icon: Boxes },
    ],
  },
];

function NavItem({ href, label, icon: Icon, onNavigate }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-secondary-foreground"
          : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  // Lock body scroll + ESC-to-close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — only on mobile, fades in/out */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-primary-foreground",
          "transition-transform duration-200 ease-out will-change-transform",
          // Mobile: hidden off-canvas by default, slide in when open
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible (overrides the mobile transform)
          "lg:translate-x-0"
        )}
      >
        {/* Brand + mobile close button */}
        <div className="flex items-center justify-between gap-2 border-b border-primary-foreground/10 px-5 py-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary font-display text-lg font-bold text-primary">
              O
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-base font-bold tracking-wide">
                OOS SHOP
              </div>
              <div className="truncate text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                Sales Recap · 2026
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-primary-foreground/80 hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/30 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scroll-thin-dark flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/40">
                {section.group}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavItem {...item} onNavigate={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-primary-foreground/10 px-5 py-3 text-[10px] text-primary-foreground/50">
          Enterprise design · v1.0
        </div>
      </aside>
    </>
  );
}
