"use client";

import { useCallback, useState } from "react";
import Sidebar from "./Sidebar";
import MobileTopbar from "./MobileTopbar";

export default function LayoutShell({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div className="min-h-screen bg-background text-ink">
      <MobileTopbar onOpen={openNav} />
      <Sidebar open={navOpen} onClose={closeNav} />
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
