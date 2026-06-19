import { formatRupiah, formatNumber } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function TopCustomers({ items, limit = 5 }) {
  const top = items.slice(0, limit);
  const max = top[0]?.[1]?.total || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Terbaik</CardTitle>
        <CardDescription>Top {limit} customer berdasarkan total belanja</CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Belum ada data</p>
        ) : (
          <ul className="space-y-2">
            {top.map(([nama, data], i) => (
              <li key={nama} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{nama}</p>
                  <p className="text-[10px] text-muted">{data.count} transaksi</p>
                  <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.total / max) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-primary">{formatRupiah(data.total)}</p>
                  <p className="text-[10px] text-success">{formatRupiah(data.profit)} profit</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
