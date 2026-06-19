import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function ProfitSharingCard({ sharing, periodLabel }) {
  if (!sharing) return null;
  const {
    profitPlugin, profitJasa,
    pluginAndri, pluginAsrud, pluginModal,
    jasaAndri, jasaAsrud, jasaPengembangan,
    transferAndri, transferAsrud, totalModal,
  } = sharing;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground p-3">
        <p className="text-[9px] uppercase tracking-widest font-semibold opacity-70">
          Pembagian Profit · {periodLabel}
        </p>
        <CardTitle className="text-primary-foreground mt-0.5 text-sm">Andri & Asrud</CardTitle>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] opacity-70">Net Profit Bersih</p>
          <p className="font-display text-base font-extrabold">
            {formatRupiah(transferAndri + transferAsrud)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Plugin */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Plugin · {formatRupiah(profitPlugin)}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Bucket label="Andri" pct={40} value={pluginAndri} color="emerald" />
            <Bucket label="Asrud" pct={40} value={pluginAsrud} color="primary" />
            <Bucket label="Modal" pct={20} value={pluginModal} color="sky" />
          </div>
        </div>
        {/* Jasa */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Jasa · {formatRupiah(profitJasa)}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Bucket label="Andri" pct={35} value={jasaAndri} color="emerald" />
            <Bucket label="Asrud" pct={35} value={jasaAsrud} color="primary" />
            <Bucket label="Kembang" pct={30} value={jasaPengembangan} color="sky" />
          </div>
        </div>
        {/* Transfer summary */}
        <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted font-semibold">Transfer Andri</p>
            <p className="font-display text-sm font-bold text-success mt-0.5">{formatRupiah(transferAndri)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted font-semibold">Transfer Asrud</p>
            <p className="font-display text-sm font-bold text-primary mt-0.5">{formatRupiah(transferAsrud)}</p>
          </div>
        </div>
        <p className="text-[9px] text-muted text-center pt-0.5">
          Asrud menerima {formatRupiah(totalModal)} lebih banyak (menangani Modal Plugin & Pengembangan Jasa)
        </p>
      </CardContent>
    </Card>
  );
}

function Bucket({ label, pct, value, color = "primary" }) {
  const colorMap = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    emerald: "border-success/20 bg-success/5 text-success",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };
  return (
    <div className={`rounded-md p-1.5 text-center border ${colorMap[color]}`}>
      <p className="font-display text-base font-black leading-none">{pct}%</p>
      <p className="text-[9px] font-bold text-ink mt-0.5">{label}</p>
      <p className="font-mono text-[9px] mt-0.5 break-all font-bold">{formatRupiah(value)}</p>
    </div>
  );
}
