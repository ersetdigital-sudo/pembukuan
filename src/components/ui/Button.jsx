import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-deep active:shadow-press rounded-full shadow-sm",
  secondary:
    "bg-surface text-ink border border-hairline shadow-card hover:shadow-card-hover rounded-full",
  chip:
    "bg-secondary text-ink hover:bg-background-bone active:shadow-press rounded-full",
  outline:
    "border border-hairline bg-surface text-ink hover:bg-secondary rounded-full",
  ghost:
    "text-ink hover:bg-secondary rounded-full",
  danger:
    "bg-danger text-on-primary hover:bg-danger/90 active:shadow-press rounded-full",
};

const sizes = {
  sm: "h-9 px-4 text-button-sm",
  md: "h-[44px] px-6 text-button-md",
  lg: "h-12 px-8 text-body-md font-medium",
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
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export default Button;
