import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

// Sub-caption pill uses status tokens — icon chip itself stays black/white chrome
const PILL = {
  emerald: "bg-success/10 text-success",
  primary: "bg-secondary text-ash",
  secondary: "bg-secondary text-ash",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  sky: "bg-info/10 text-info",
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
    <Card className="p-5 md:p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-sm font-medium text-ash leading-none truncate">
          {title}
        </p>
        <div className="h-9 w-9 rounded-sm bg-primary text-on-primary grid place-items-center shrink-0">
          {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        </div>
      </div>
      <p
        className={cn(
          "text-heading-md font-bold leading-tight break-words tabular-nums",
          valueClass || "text-ink"
        )}
      >
        {value}
      </p>
      {sub && (
        <span
          className={cn(
            "inline-flex self-start items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-none truncate max-w-full",
            PILL[color] || PILL.primary
          )}
        >
          {sub}
        </span>
      )}
    </Card>
  );
}
