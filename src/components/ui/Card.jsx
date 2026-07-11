import { cn } from "@/lib/utils/cn";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md border border-hairline bg-surface-card",
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
    <h3 className={cn("text-sm font-semibold text-ink", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children }) {
  return <p className={cn("text-[11px] text-ash mt-0.5", className)}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export default Card;
