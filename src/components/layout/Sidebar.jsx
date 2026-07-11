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
        "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-body-sm font-medium transition-all duration-150",
        active
          ? "bg-white/15 text-on-dark"
          : "text-on-dark/70 hover:bg-white/10 hover:text-on-dark"
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
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
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-black">
              O
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-body-sm font-bold tracking-tight">
                OOS SHOP
              </div>
              <div className="truncate text-[11px] text-on-dark/50">
                Sales Recap 2026
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-dark/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scroll-thin-dark flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-on-dark/40">
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
        <div className="border-t border-white/10 px-5 py-3 text-[11px] text-on-dark/40">
          Uber design v1.0
        </div>
      </aside>
    </>
  );
}
