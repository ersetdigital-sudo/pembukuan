import { Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ProfitSharingCard({ sharing, periodLabel }) {
  if (!sharing) return null;
  const { transferAndri, transferAsrud } = sharing;

  const total = transferAndri + transferAsrud;
  const pctAndri = total > 0 ? (transferAndri / total) * 100 : 50;
  const pctAsrud = total > 0 ? (transferAsrud / total) * 100 : 50;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Pembagian Profit · {periodLabel}
          </p>
          <CardTitle className="mt-0.5">Andri & Asrud</CardTitle>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Andri row */}
        <TransferRow
          initials="A"
          label="Andri"
          value={transferAndri}
          pct={pctAndri}
        />

        {/* Asrud row */}
        <TransferRow
          initials="As"
          label="Asrud"
          value={transferAsrud}
          pct={pctAsrud}
        />

        {/* Total */}
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Total</span>
          <span className="font-display text-sm font-extrabold tabular-nums text-ink">
            {formatRupiah(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TransferRow({ initials, label, value, pct }) {
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2 py-2.5">
      {/* Avatar */}
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-[10px] font-bold text-primary">
        {initials}
      </div>

      {/* Name + bar */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink">{label}</p>
          <span className="shrink-0 font-display text-[11px] font-extrabold tabular-nums text-primary">
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${positive ? "from-primary to-teal-500" : "from-danger to-red-400"} animate-bar-fill`}
            style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Value */}
      <span className={`shrink-0 font-mono text-xs font-bold tabular-nums ${positive ? "text-ink" : "text-danger"}`}>
        {formatRupiah(value)}
      </span>
    </div>
  );
}
