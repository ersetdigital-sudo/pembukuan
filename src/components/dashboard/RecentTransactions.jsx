import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { getSaleProducts } from "@/lib/utils/sale";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MP_BADGE } from "@/lib/constants";

function productLabel(s) {
  const list = getSaleProducts(s);
  return list.map((p) => p.nama_produk).filter(Boolean).join(", ") || "-";
}

export default function RecentTransactions({ items, limit = 5 }) {
  const top = items.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir di periode ini</CardDescription>
        </div>
        <Link href="/penjualan" className="text-xs font-semibold text-primary hover:underline">
          Lihat semua →
        </Link>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-ash text-center py-8">Belum ada transaksi</p>
        ) : (
          <ul className="space-y-2">
            {top.map((s) => {
              const totals = s.__totals || { totalJual: 0, profit: 0 };
              return (
                <li key={s.id} className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{productLabel(s)}</p>
                    <p className="text-[10px] text-ash">{s.nama_pembeli} · {formatDate(s.tanggal)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-primary">{formatRupiah(totals.totalJual)}</p>
                    <Badge className={`text-[9px] px-1.5 py-0 ${MP_BADGE[s.marketplace] || "bg-muted text-ink"}`}>
                      {s.marketplace}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
