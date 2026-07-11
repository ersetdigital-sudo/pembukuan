import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

const ICON_BG = {
  emerald: "bg-success/10 text-success",
  primary: "bg-primary/5 text-ink",
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
    <Card className="p-4 flex items-center gap-3">
      <div
        className={cn(
          "h-10 w-10 rounded-full grid place-items-center shrink-0",
          ICON_BG[color] || ICON_BG.primary
        )}
      >
        {Icon && <Icon className="h-4.5 w-4.5" strokeWidth={2} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-ash leading-none truncate">
          {title}
        </p>
        <p
          className={cn(
            "text-heading-sm mt-1 leading-tight break-words tabular-nums",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-stone mt-1 leading-tight truncate">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
