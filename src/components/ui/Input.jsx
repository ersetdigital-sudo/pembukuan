import { cn } from "@/lib/utils/cn";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-input bg-surface-card px-3 text-sm text-ink placeholder:text-ash",
        "focus:border-primary focus:outline-none focus:ring-0",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-input bg-surface-card px-3 py-2 text-sm text-ink placeholder:text-ash",
        "focus:border-primary focus:outline-none focus:ring-0",
        className
      )}
      {...props}
    />
  );
}

export default Input;
