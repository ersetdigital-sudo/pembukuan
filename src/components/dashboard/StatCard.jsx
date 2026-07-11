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
    <Card className="p-3 sm:p-4 flex flex-col gap-2 group relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "h-9 w-9 sm:h-10 sm:w-10 rounded-lg grid place-items-center shrink-0 shadow-sm",
            ICON_BG[color] || ICON_BG.primary
          )}
        >
          {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-ash/70 mb-0.5 leading-none">
          {title}
        </p>
        <p
          className={cn(
            "text-base sm:text-xl font-bold leading-tight break-words",
            valueClass || "text-ink"
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[10px] sm:text-xs text-ash/60 mt-1.5 leading-tight font-medium">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
