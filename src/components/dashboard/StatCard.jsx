import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

const ICON_BG = {
  emerald: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
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
    <Card className="p-2 sm:p-3 flex items-center gap-2">
      <div
        className={cn(
          "h-7 w-7 sm:h-9 sm:w-9 rounded-md grid place-items-center shrink-0",
          ICON_BG[color] || ICON_BG.primary
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-button-sm font-mono uppercase tracking-[0.5px] text-ash leading-none truncate">
          {title}
        </p>
        <p
          className={cn(
            "text-sm sm:text-lg font-bold mt-0.5 sm:mt-1 leading-tight break-words",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[10px] text-ash mt-0.5 leading-tight truncate">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
