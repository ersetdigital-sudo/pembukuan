import { cn } from "@/lib/utils/cn";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline/50 bg-gradient-to-br from-surface-card to-surface-card/50 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm",
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
    <div className={cn("px-3.5 pt-3.5 pb-2", className)}>{children}</div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={cn("text-xs sm:text-sm font-bold text-ink tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children }) {
  return <p className={cn("text-[10px] sm:text-xs text-ash/70 mt-0.5 font-medium", className)}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("px-3.5 py-3", className)}>{children}</div>;
}

export default Card;
