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
        "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-on-primary"
          : "text-on-dark-mute hover:bg-on-dark/10 hover:text-on-dark"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
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
      {/* Backdrop — only on mobile */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-surface-deep/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface-dark text-on-dark",
          "transition-transform duration-200 ease-out will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Brand + mobile close */}
        <div className="flex items-center justify-between gap-2 border-b border-hairline-strong/20 px-5 py-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-lg font-bold text-on-primary">
              O
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-bold tracking-tight">
                OOS SHOP
              </div>
              <div className="truncate text-[10px] font-mono uppercase tracking-[0.5px] text-on-dark-mute">
                Sales Recap · 2026
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-sm text-on-dark-mute hover:bg-on-dark/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scroll-thin-dark flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="mb-1.5 px-3 text-button-sm font-mono uppercase tracking-[0.5px] text-on-dark-mute/60">
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
        <div className="border-t border-hairline-strong/20 px-5 py-3 text-[10px] text-on-dark-mute/50">
          Sanity design · v1.0
        </div>
      </aside>
    </>
  );
}
