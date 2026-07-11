"use client";

import { useState, createContext, useContext } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = "", children }) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      onBlur={() => setTimeout(() => ctx.setOpen(false), 150)}
      className={cn(
        "h-10 w-full rounded-lg border border-hairline bg-surface-card px-3 text-sm text-ink inline-flex items-center justify-between gap-2 transition-all",
        "hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-sm",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 text-ash shrink-0 transition-transform", ctx.open && "rotate-180")} />
    </button>
  );
}

export function SelectValue({ placeholder = "Pilih...", children }) {
  const ctx = useContext(SelectContext);
  // If children are passed (e.g. a resolved label like "Juni"), render them.
  // Otherwise fall back to the raw value (or placeholder).
  if (children != null) {
    return <span className="truncate text-ink">{children}</span>;
  }
  return (
    <span className={ctx.value ? "text-ink" : "text-ash"}>
      {ctx.value || placeholder}
    </span>
  );
}

export function SelectContent({ className = "", children }) {
  const ctx = useContext(SelectContext);
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg border border-hairline bg-surface-card shadow-lg",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

export function SelectItem({ value, children, className = "" }) {
  const ctx = useContext(SelectContext);
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors",
        "hover:bg-surface-bone",
        selected && "bg-primary/10 text-primary font-semibold",
        className
      )}
    >
      {children}
      {selected && <Check className="h-4 w-4 text-primary" />}
    </button>
  );
}
