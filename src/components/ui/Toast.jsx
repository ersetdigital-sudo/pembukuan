"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ToastContext = createContext(null);

const ICONS = {
  success: { Icon: CheckCircle2, color: "text-success", bg: "bg-success/15" },
  error: { Icon: XCircle, color: "text-danger", bg: "bg-danger/15" },
  warning: { Icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15" },
  info: { Icon: Info, color: "text-secondary", bg: "bg-secondary/15" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((opts) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast = { id, type: "info", duration: 4000, ...opts };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = {
    success: (message, opts) => add({ ...opts, message, type: "success" }),
    error: (message, opts) => add({ ...opts, message, type: "error" }),
    warning: (message, opts) => add({ ...opts, message, type: "warning" }),
    info: (message, opts) => add({ ...opts, message, type: "info" }),
    custom: (opts) => add(opts),
    remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  // Wrap the api in a `toast` property so the ergonomic
  // `const { toast } = useToast(); toast.success(...)` pattern works.
  // Direct usage like `useToast().success(...)` still works too.
  return { ...ctx, toast: ctx };
}

function Toaster({ toasts, remove }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-[60] flex flex-col gap-2 sm:max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const palette = ICONS[t.type] || ICONS.info;
        const { Icon } = palette;
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto relative flex items-start gap-3 rounded-md border border-hairline bg-surface-card p-3  animate-slide-from-right",
              "min-w-0 overflow-hidden"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full grid place-items-center shrink-0 ring-2 ring-surface-2",
                palette.bg
              )}
            >
              <Icon
                className={cn("h-4 w-4", palette.color)}
                strokeWidth={2.5}
              />
            </div>
            <div className="min-w-0 flex-1">
              {t.title && (
                <p className="text-[13px] font-bold text-ink leading-tight">
                  {t.title}
                </p>
              )}
              <p
                className={cn(
                  "text-xs text-ink/80 leading-relaxed break-words",
                  t.title && "mt-0.5"
                )}
              >
                {t.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Tutup"
              className="p-1 text-ash hover:text-ink hover:bg-surface rounded transition-colors shrink-0 -mr-1 -mt-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Progress bar (auto-dismiss indicator) */}
            {t.duration > 0 && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
                style={{
                  width: "100%",
                  animation: `toast-shrink ${t.duration}ms linear forwards`,
                  color:
                    t.type === "success"
                      ? "#16A34A"
                      : t.type === "error"
                      ? "#DC2626"
                      : t.type === "warning"
                      ? "#EAB308"
                      : "#000000",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
