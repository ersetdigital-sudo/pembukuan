import { cn } from "@/lib/utils/cn";

export function Table({ className = "", children }) {
  return (
    <div className="overflow-x-auto rounded-sm shadow-card">
      <table className={cn("w-full text-sm border-collapse", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children }) {
  return (
    <thead className={cn("bg-surface-dark text-white", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children }) {
  return <tbody className={cn("", className)}>{children}</tbody>;
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-hairline transition-colors even:bg-background-canvas odd:bg-white hover:bg-secondary/50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={cn(
        "text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/90 border-r border-white/10 last:border-r-0",
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
    <td
      className={cn(
        "px-4 py-3 text-sm text-ink border-r border-hairline last:border-r-0",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
