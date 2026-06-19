"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatRupiah } from "@/lib/utils/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-md shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-medium" style={{ color: p.color }}>
          {p.name}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function RevenueChart({ data, title = "Tren Bulanan", subtitle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}jt`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="penjualan" name="Penjualan" fill="#072C2C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#16A34A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="biaya" name="Biaya" fill="#FF5F03" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
