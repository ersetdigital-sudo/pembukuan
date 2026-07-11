"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  User,
} from "lucide-react";

const MOBILE_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/penjualan", label: "Penjualan", icon: ShoppingCart },
  { href: "/pembelian", label: "Pembelian", icon: ShoppingBag },
  { href: "/profil", label: "Profil", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-hairline bg-surface shadow-lg lg:hidden">
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-3 px-2 transition-all",
              isActive
                ? "text-primary"
                : "text-ash hover:text-ink"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
