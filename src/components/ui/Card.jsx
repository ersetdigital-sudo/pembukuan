import { cn } from "@/lib/utils/cn";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-sm bg-surface-card shadow-card hover:shadow-card-hover transition-shadow duration-200",
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
    <div className={cn("px-5 pt-5 pb-2", className)}>{children}</div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={cn("text-body-md font-bold text-ink", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children }) {
  return <p className={cn("text-body-sm text-ash mt-0.5", className)}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}

export default Card;
