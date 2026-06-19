import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
  plugin:
    "bg-plugin text-plugin-foreground hover:bg-plugin/90 shadow-sm",
  outline:
    "border border-border bg-surface-2 text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export default Button;
