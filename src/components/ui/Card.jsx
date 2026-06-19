import { cn } from "@/lib/utils/cn";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface-2 shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={cn("px-4 pt-4 pb-2", className)}>{children}</div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={cn("text-sm font-display font-semibold text-ink", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children }) {
  return <p className={cn("text-[11px] text-muted mt-0.5", className)}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export default Card;
