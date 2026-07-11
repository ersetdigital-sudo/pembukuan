import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

// Sub-caption text color uses status tokens — icon chip itself stays black/white chrome
const SUB_COLOR = {
  emerald: "text-success",
  primary: "text-stone",
  secondary: "text-stone",
  warning: "text-warning",
  danger: "text-danger",
  sky: "text-info",
};

export default function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color = "primary",
  valueClass = "",
  className = "",
}) {
  return (
    <Card className={cn("p-4 flex items-center gap-3", className)}>
      <div className="h-9 w-9 rounded-sm bg-primary text-on-primary grid place-items-center shrink-0">
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-ash leading-none truncate">
          {title}
        </p>
        <p
          className={cn(
            "text-heading-sm font-bold mt-1 leading-tight break-words tabular-nums truncate",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && (
          <p
            className={cn(
              "text-[11px] font-medium mt-0.5 leading-tight truncate",
              SUB_COLOR[color] || SUB_COLOR.primary
            )}
          >
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
