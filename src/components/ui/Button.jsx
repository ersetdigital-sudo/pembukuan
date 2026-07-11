import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-primary text-on-primary hover:bg-secondary rounded-full",
  secondary:
    "bg-surface-dark text-on-dark-mute hover:bg-secondary hover:text-on-primary rounded-full",
  plugin:
    "bg-secondary text-on-secondary hover:bg-secondary/90 rounded-full",
  outline:
    "border border-hairline bg-background-bone text-ink hover:bg-secondary hover:text-on-primary rounded-full",
  ghost: "text-ink hover:bg-secondary/10 rounded-sm",
  danger:
    "bg-danger text-on-primary hover:bg-danger/90 rounded-full",
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
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export default Button;
