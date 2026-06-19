"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { CHART_COLORS } from "@/lib/constants";

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div className="bg-surface-2 border border-border rounded-md shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold">{name}</p>
      <p className="text-primary font-bold">{formatRupiah(value)}</p>
      <p className="text-muted">{inner.pct}% dari total</p>
    </div>
  );
};

export default function CategoryChart({ data, title = "Distribusi", subtitle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">Belum ada data</p>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.map((d, i) => (
                <li key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="font-medium text-ink">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted">{d.pct}%</span>
                    <span className="font-bold text-primary w-28 text-right">{formatRupiah(d.value)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
