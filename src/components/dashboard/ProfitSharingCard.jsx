import { Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ProfitSharingCard({ sharing, periodLabel }) {
  if (!sharing) return null;

  const pluginP = sharing.pluginPartners || [];
  const jasaP = sharing.jasaPartners || [];
  const pluginS = sharing.pluginShares || {};
  const jasaS = sharing.jasaShares || {};

  // Build person-based transfer blocks dynamically
  const persons = {};
  pluginP.forEach((p) => {
    const key = p.name.toLowerCase().replace(/[^a-z]/g, "");
    if (!persons[key]) persons[key] = { name: p.name, initials: p.initials, details: [], total: 0 };
    const val = pluginS[key] || 0;
    persons[key].details.push({ label: `Plugin (${p.percentage}%)`, value: val });
    persons[key].total += val;
  });
  jasaP.forEach((p) => {
    const key = p.name.toLowerCase().replace(/[^a-z]/g, "");
    if (!persons[key]) persons[key] = { name: p.name, initials: p.initials, details: [], total: 0 };
    const val = jasaS[key] || 0;
    persons[key].details.push({ label: `Jasa (${p.percentage}%)`, value: val });
    persons[key].total += val;
  });

  const personList = Object.values(persons);

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ash">
            Rekap Transfer - {periodLabel}
          </p>
          <CardTitle className="mt-0.5">Pembagian Profit</CardTitle>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/5 text-ink">
          <Wallet className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {personList.map((person, idx) => (
          <div key={person.name}>
            {idx > 0 && <div className="h-px bg-divider mb-4" />}
            <TransferBlock
              name={person.name}
              initials={person.initials}
              total={person.total}
              details={person.details}
              tone={idx === 0 ? "primary" : "success"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransferBlock({ name, initials, total, details, tone }) {
  const hasShare = details.reduce((s, d) => s + (d.value || 0), 0) > 0;
  const totalPositive = total >= 0;

  const toneMap = {
    primary: {
      avatar: "bg-primary text-white",
      bar: "from-ink to-ash",
      pct: "text-ink",
    },
    success: {
      avatar: "bg-success text-white",
      bar: "from-success to-emerald-300",
      pct: "text-success",
    },
  };
  const t = toneMap[tone] || toneMap.primary;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${t.avatar}`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-bold text-ink truncate">{name}</p>
            <p className="text-[11px] text-stone">Transfer ke</p>
          </div>
        </div>
        <span className={`shrink-0 font-mono text-body-sm font-bold tabular-nums ${totalPositive ? "text-ink" : "text-danger"}`}>
          {formatRupiah(total)}
        </span>
      </div>

      <ul className="space-y-2.5 pl-[42px]">
        {details.map((d) => {
          const pct = hasShare && total > 0 ? (d.value / total) * 100 : 0;
          const positive = d.value >= 0;
          return (
            <li key={d.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-ash truncate">{d.label}</span>
                <span className={`shrink-0 font-mono text-[12px] font-bold tabular-nums ${positive ? "text-ink" : "text-danger"}`}>
                  {formatRupiah(d.value)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${positive ? t.bar : "from-danger to-red-300"} animate-bar-fill`}
                    style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                  />
                </div>
                <span className={`shrink-0 w-8 text-right text-[11px] font-bold tabular-nums ${t.pct}`}>
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
