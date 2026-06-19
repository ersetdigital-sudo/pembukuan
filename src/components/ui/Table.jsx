import { cn } from "@/lib/utils/cn";

export function Table({ className = "", children }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}
export function TableHeader({ className = "", children }) {
  return <thead className={cn("bg-surface/50 border-b border-border", className)}>{children}</thead>;
}
export function TableBody({ className = "", children }) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}
export function TableRow({ className = "", children, ...props }) {
  return (
    <tr className={cn("hover:bg-surface/40 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}
export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={cn(
        "text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}
export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={cn("px-4 py-2.5 text-sm", className)} {...props}>
      {children}
    </td>
  );
}
