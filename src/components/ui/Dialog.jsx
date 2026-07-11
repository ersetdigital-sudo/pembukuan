"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Dialog({ open, onOpenChange, children }) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm animate-fade-up"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Content slot "" children render the actual DialogContent */}
      {children}
    </div>
  );
}

export function DialogContent({ className = "", children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "relative z-10 w-full rounded-md sm:rounded-md border border-hairline bg-surface-card ",
        "max-h-[92vh] sm:max-h-[90vh] overflow-y-auto scroll-thin",
        "animate-fade-scale",
        // Mobile: rounded di top aja, full-width sheet
        "rounded-b-none sm:rounded-b-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = "", children, onClose }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline",
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="grid h-8 w-8 place-items-center rounded-md text-ash hover:bg-surface hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className = "", children }) {
  return (
    <h2 className={cn("text-base font-bold text-ink leading-tight", className)}>
      {children}
    </h2>
  );
}

export function DialogFooter({ className = "", children }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-hairline bg-surface/40",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Dialog;
