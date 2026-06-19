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
          <p className="text-sm text-muted text-center py-8">Belum ada data</p>
        ) : (
          <ul className="space-y-2">
            {top.map(([nama, data], i) => (
              <li key={nama} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium truncate">{nama}</p>
                    {data.kategori && (
                      <Badge variant={data.kategori === "Plugin" ? "primary" : "success"}>
                        {data.kategori}
                      </Badge>
                    )}
                  </div>
                  <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.qty / maxQty) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{formatNumber(data.qty)} pcs</p>
                  <p className="text-[10px] text-success font-bold">{formatRupiah(data.profit)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
