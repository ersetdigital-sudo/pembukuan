import { Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ProfitSharingCard({ sharing, periodLabel }) {
  if (!sharing) return null;

  const {
    transferAndri,
    transferAsrud,
    pluginAndri,
    jasaAndri,
    pluginAsrud,
    jasaAsrud,
    pluginModal,
  } = sharing;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-button-sm font-mono uppercase tracking-[0.5px] text-ash">
            Rekap Transfer · {periodLabel}
          </p>
          <CardTitle className="mt-0.5">Pembagian Profit</CardTitle>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Andri */}
        <TransferBlock
          name="Andri"
          initials="A"
          total={transferAndri}
          details={[
            { label: "Plugin (40%)", value: pluginAndri },
            { label: "Jasa (40%)", value: jasaAndri },
          ]}
          tone="secondary"
        />

        {/* Divider */}
        <div className="h-px bg-hairline" />

        {/* Asrud */}
        <TransferBlock
          name="Asrud"
          initials="As"
          total={transferAsrud}
          details={[
            { label: "Plugin (40%)", value: pluginAsrud },
            { label: "Jasa (60%)", value: jasaAsrud },
            { label: "Modal & Dev (20%)", value: pluginModal },
          ]}
          tone="success"
        />
      </CardContent>
    </Card>
  );
}

function TransferBlock({ name, initials, total, details, tone }) {
  const isSecondary = tone === "secondary";
  const hasShare = details.reduce((s, d) => s + (d.value || 0), 0) > 0;
  const totalPositive = total >= 0;

  const toneMap = {
    secondary: {
      avatar: "bg-secondary/10 text-secondary",
      bar: "from-secondary to-blue-400",
      pct: "text-secondary",
      badge: "bg-secondary/10 text-secondary",
    },
    success: {
      avatar: "bg-success/10 text-success",
      bar: "from-success to-emerald-400",
      pct: "text-success",
      badge: "bg-success/10 text-success",
    },
  };
  const t = isSecondary ? toneMap.secondary : toneMap.success;

  return (
    <div>
      {/* Person header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${t.avatar}`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink truncate">{name}</p>
            <p className="text-[10px] text-ash">Transfer ke</p>
          </div>
        </div>
        <span className={`shrink-0 font-mono text-xs font-bold tabular-nums ${totalPositive ? "text-ink" : "text-danger"}`}>
          {formatRupiah(total)}
        </span>
      </div>

      {/* Detail rows */}
      <ul className="space-y-2 pl-9">
        {details.map((d) => {
          const pct = hasShare && total > 0 ? (d.value / total) * 100 : 0;
          const positive = d.value >= 0;
          return (
            <li key={d.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-ash truncate">{d.label}</span>
                <span className={`shrink-0 font-mono text-[11px] font-bold tabular-nums ${positive ? "text-ink" : "text-danger"}`}>
                  {formatRupiah(d.value)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-bone">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${positive ? t.bar : "from-danger to-red-400"} animate-bar-fill`}
                    style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                  />
                </div>
                <span className={`shrink-0 w-8 text-right text-[10px] font-bold tabular-nums ${t.pct}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
