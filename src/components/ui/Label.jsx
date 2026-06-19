import { cn } from "@/lib/utils/cn";

export function Label({ className = "", children, ...props }) {
  return (
    <label
      className={cn("text-xs font-medium text-ink", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export default Label;
