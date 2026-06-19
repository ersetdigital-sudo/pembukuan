import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

const ICON_BG = {
  emerald: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  sky: "bg-sky-100 text-sky-600",
};

export default function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color = "primary",
  valueClass = "",
}) {
  return (
    <Card className="p-3 flex items-center gap-2.5">
      <div
        className={cn(
          "h-9 w-9 rounded-md grid place-items-center shrink-0",
          ICON_BG[color] || ICON_BG.primary
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted leading-none">
          {title}
        </p>
        <p
          className={cn(
            "font-display text-lg font-bold mt-1 leading-tight break-words",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && <p className="text-[10px] text-muted mt-0.5 leading-tight truncate">{sub}</p>}
      </div>
    </Card>
  );
}
