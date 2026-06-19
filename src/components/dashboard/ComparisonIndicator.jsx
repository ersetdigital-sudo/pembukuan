import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPercent } from "@/lib/utils/format";

export default function ComparisonIndicator({ current, previous, label = "vs periode lalu", reverse = false }) {
  if (previous == null || previous === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted">
        <Minus className="h-3 w-3" />
        {label}
      </span>
    );
  }
  const diff = current - previous;
  const pct = (diff / Math.abs(previous)) * 100;
  // For "reverse" metrics (e.g. costs, refunds), up is bad
  const isUp = diff > 0;
  const isGood = reverse ? !isUp : isUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold",
        pct === 0
          ? "text-muted"
          : isGood
          ? "text-success"
          : "text-danger"
      )}
    >
      {pct === 0 ? (
        <Minus className="h-3 w-3" />
      ) : isUp ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {formatPercent(Math.abs(pct), 1)} <span className="font-normal text-muted-foreground">{label}</span>
    </span>
  );
}
