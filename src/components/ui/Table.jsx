import { cn } from "@/lib/utils/cn";

export function Table({ className = "", children }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children }) {
  return <thead className={cn("border-b border-hairline", className)}>{children}</thead>;
}

export function TableBody({ className = "", children }) {
  return <tbody className={cn("divide-y divide-hairline", className)}>{children}</tbody>;
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr className={cn("hover:bg-secondary/30 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={cn(
        "text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ash",
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
