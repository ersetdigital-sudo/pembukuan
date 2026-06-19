import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-surface text-ink border border-border",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
  outline: "border border-border text-ink bg-transparent",
};

export function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
