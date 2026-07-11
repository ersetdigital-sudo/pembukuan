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
          <p className="text-xs sm:text-sm text-ash text-center py-6">Belum ada data</p>
        ) : (
          <ul className="space-y-2.5">
            {top.map(([nama, data], i) => (
              <li key={nama} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/5 transition-all duration-200 group">
                <span className="h-5 w-5 rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0 shadow-sm">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">{nama}</p>
                  <p className="text-[10px] text-ash/60 font-medium">{data.count} transaksi</p>
                  <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-secondary/60 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (data.total / max) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] sm:text-xs font-bold text-primary">{formatRupiah(data.total)}</p>
                  <p className="text-[9px] sm:text-xs text-success font-bold">{formatRupiah(data.profit)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
