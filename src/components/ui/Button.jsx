import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 active:scale-95 rounded-full transition-all",
  secondary:
    "bg-surface-dark text-on-dark-mute hover:bg-surface-dark/90 hover:text-on-primary rounded-full transition-all",
  plugin:
    "bg-secondary text-on-secondary hover:bg-secondary/90 rounded-full transition-all",
  outline:
    "border border-hairline bg-background-bone text-ink hover:bg-hairline/50 hover:text-ink rounded-full transition-all",
  ghost: "text-ink hover:bg-hairline/20 rounded-sm transition-all",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:scale-95 rounded-full transition-all",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-[44px] px-4 text-button-md",
  lg: "h-12 px-6 text-base",
  icon: "h-[44px] w-[44px] p-0",
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
        "inline-flex items-center justify-center gap-2 font-semibold disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export default Button;
