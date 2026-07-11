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
    <Card className="p-4 sm:p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-lg grid place-items-center shrink-0",
            ICON_BG[color] || ICON_BG.primary
          )}
        >
          {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-ash mb-1 leading-none">
          {title}
        </p>
        <p
          className={cn(
            "text-lg sm:text-2xl font-bold leading-tight break-words",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs sm:text-sm text-ash mt-2 leading-tight">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
