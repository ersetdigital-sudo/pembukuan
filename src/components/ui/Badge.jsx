import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-background-bone text-surface-dark border border-hairline",
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary text-on-secondary",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
  info: "bg-info/15 text-info border border-info/30",
  outline: "border border-hairline text-ink bg-transparent",
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
