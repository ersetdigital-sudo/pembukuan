import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-secondary text-ink",
  primary: "bg-primary text-white",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  outline: "border border-hairline text-ink bg-transparent",
};

export function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
