"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

const PALETTE = {
  danger: {
    icon: Trash2,
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    buttonVariant: "danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    buttonVariant: "primary",
  },
  info: {
    icon: Info,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    buttonVariant: "primary",
  },
};

/**
 * Reusable confirm dialog — replaces window.confirm() dengan UI
 * yang match design system. Modern, compact, responsive.
 *
 * Props:
 *   open: boolean
 *   onOpenChange: (open) => void
 *   onConfirm: () => void          // dipanggil saat user klik confirm
 *   title: string                  // judul dialog
 *   message: string | ReactNode    // body message (bisa ada <strong> dll)
 *   confirmText?: string           // default: "Hapus"
 *   cancelText?: string            // default: "Batal"
 *   variant?: "danger" | "warning" | "info"  // default: "danger"
 *   loading?: boolean              // disable buttons + show spinner state
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Konfirmasi",
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
  loading = false,
}) {
  const palette = PALETTE[variant] || PALETTE.danger;
  const Icon = palette.icon;

  // Keyboard shortcuts: Enter = confirm, Esc = cancel
  useEffect(() => {
    if (!open || loading) return;
    const onKey = (e) => {
      if (e.key === "Enter") {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        onConfirm?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent className="max-w-[22rem] sm:max-w-sm p-0">
        <DialogHeader
          onClose={loading ? undefined : () => onOpenChange?.(false)}
          className="px-4 sm:px-5 py-3 sm:py-3.5"
        >
          <DialogTitle className="text-[15px] sm:text-base leading-snug">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-5 py-3 sm:py-3.5">
          <div className="flex items-start gap-3">
            <div
              className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${palette.iconBg}`}
            >
              <Icon
                className={`h-4 w-4 ${palette.iconColor}`}
                strokeWidth={2.25}
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[13px] text-ink leading-relaxed break-words">
                {message}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-3 sm:px-5 py-3 sm:py-3.5 gap-2 flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={loading}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 text-sm"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={palette.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 text-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Memproses...</span>
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
