"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { KATEGORI_BIAYA } from "@/lib/constants";
import { getMockData } from "@/lib/data/mock";

const KAT_COLORS = {
  "Fee Marketplace": "bg-secondary/15 text-secondary border-secondary/30",
  "Server & Hosting": "bg-primary/10 text-primary border-primary/20",
  Internet: "bg-sky-100 text-sky-700 border-sky-200",
  Iklan: "bg-pink-100 text-pink-700 border-pink-200",
  "Alat Kantor": "bg-amber-100 text-amber-700 border-amber-200",
  Transport: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Konsumsi: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Lain-lain": "bg-muted text-muted-foreground border-border",
};

export default function BiayaPage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  const { expenses } = getMockData();
  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [expenses]
  );

  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (kategori !== "all" && e.kategori !== kategori) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (e.keterangan || "").toLowerCase().includes(q);
    });
  }, [sorted, search, kategori]);

  const totalAll = sorted.reduce((s, e) => s + e.jumlah, 0);
  const totalFiltered = filtered.reduce((s, e) => s + e.jumlah, 0);
  const totalFeeMP = sorted.filter((e) => e.kategori === "Fee Marketplace").reduce((s, e) => s + e.jumlah, 0);
  const totalOps = totalAll - totalFeeMP;

  return (
    <div>
      <PageHeader
        title="Biaya"
        subtitle="Catat semua pengeluaran & biaya operasional"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Stat label="Total Semua" value={formatRupiah(totalAll)} />
        <Stat label="Fee Marketplace" value={formatRupiah(totalFeeMP)} color="text-secondary" />
        <Stat label="Operasional" value={formatRupiah(totalOps)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Cari keterangan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-surface-2 text-sm"
        >
          <option value="all">Semua Kategori</option>
          {KATEGORI_BIAYA.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="px-4 py-2 border-b border-border bg-surface/30 text-xs flex justify-between text-muted">
          <span>Menampilkan {filtered.length} dari {sorted.length} entri</span>
          <span className="font-mono font-semibold text-foreground">Total: {formatRupiah(totalFiltered)}</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState message="Belum ada biaya" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted">{formatDate(e.tanggal)}</TableCell>
                  <TableCell>
                    <Badge className={KAT_COLORS[e.kategori] || ""}>{e.kategori}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{e.keterangan}</TableCell>
                  <TableCell className="text-right font-semibold text-secondary">
                    {formatRupiah(e.jumlah)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, color = "text-ink" }) {
  return (
    <div className="rounded-card border border-border bg-surface-2 p-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">{label}</p>
      <p className={`font-display text-lg font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
