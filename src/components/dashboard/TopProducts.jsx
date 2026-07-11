import Link from "next/link";
import { formatRupiah, formatNumber } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function TopProducts({ items, limit = 5 }) {
  const top = items.slice(0, limit);
  const maxQty = top[0]?.[1]?.qty || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>Top {limit} produk berdasarkan quantity</CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-xs sm:text-sm text-ash text-center py-6">Belum ada data</p>
        ) : (
          <ul className="space-y-2.5">
            {top.map(([nama, data], i) => (
              <li key={nama} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-primary/5 transition-all duration-200 group">
                <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0 shadow-sm">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <p className="text-xs sm:text-sm font-semibold truncate">{nama}</p>
                    {data.kategori && (
                      <Badge variant={data.kategori === "Plugin" ? "primary" : "success"} className="text-[9px] py-0.5 px-1.5">
                        {data.kategori}
                      </Badge>
                    )}
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (data.qty / maxQty) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] sm:text-xs font-bold text-ink">{formatNumber(data.qty)} pcs</p>
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
