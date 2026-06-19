import { Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

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
    <div className="space-y-3">
      {/* Section label */}
      <div>
        <h3 className="font-display text-base font-bold text-ink">Rekap Transfer</h3>
        <p className="text-xs text-muted mt-0.5">
          Ringkasan jumlah yang harus ditransfer ke masing-masing orang — {periodLabel}
        </p>
      </div>

      {/* Andri mini-card */}
      <TransferCard
        name="Andri"
        initials="A"
        total={transferAndri}
        details={[
          { label: "Plugin (40%)", value: pluginAndri },
          { label: "Jasa (40%)", value: jasaAndri },
        ]}
      />

      {/* Asrud mini-card */}
      <TransferCard
        name="Asrud"
        initials="As"
        total={transferAsrud}
        details={[
          { label: "Plugin (40%)", value: pluginAsrud },
          { label: "Jasa (60%)", value: jasaAsrud },
          { label: "Modal & Dev Plugin (20%)", value: pluginModal },
        ]}
      />
    </div>
  );
}

function TransferCard({ name, initials, total, details }) {
  const sum = details.reduce((s, d) => s + (d.value || 0), 0);
  const hasShare = sum > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_40px_-12px_rgba(99,102,241,0.15)]">

      {/* Header — icon chip + name */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-plugin/10 text-plugin">
            <Wallet className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Transfer ke
            </p>
            <h3 className="mt-0.5 font-display text-lg font-bold text-ink truncate">
              {name}
            </h3>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-plugin/10 font-display text-[11px] font-bold text-plugin">
            {initials}
          </span>
        </div>
      </div>

      {/* Composition — each source as a row with mini progress bar + % contribution */}
      <ul className="px-3 pb-3 space-y-2.5">
        {details.map((d) => {
          const pct = hasShare ? (d.value / sum) * 100 : 0;
          const positive = d.value >= 0;
          return (
            <li key={d.label} className="px-2 py-2 rounded-lg hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted">{d.label}</span>
                <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-ink">
                  {formatRupiah(d.value)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${positive ? "from-plugin to-indigo-400" : "from-danger to-red-400"} animate-bar-fill`}
                    style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                  />
                </div>
                <span className="shrink-0 w-10 text-right font-display text-[11px] font-bold tabular-nums text-plugin">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Hero total */}
      <div className="mx-3 mb-3 rounded-xl bg-plugin-soft/50 px-3 py-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-plugin">
          Total Transfer
        </span>
        <span className="font-display text-base font-extrabold tabular-nums text-plugin">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}
