"use client";

import { useState, useMemo } from "react";
import { Search, Receipt, Tag, Briefcase } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import { KATEGORI_BIAYA } from "@/lib/constants";
import { useSupabaseData } from "@/hooks/useSupabaseData";

// Badge warna per kategori — teks selalu warna solid (bukan token `secondary`
// yang cuma cocok buat background, biar tetap terbaca)
const KAT_COLORS = {
  "Fee Marketplace": "bg-info/10 text-info border border-info/20",
  "Server & Hosting": "bg-primary/10 text-ink border border-primary/20",
  Internet: "bg-sky-100 text-sky-700 border border-sky-200",
  Iklan: "bg-pink-100 text-pink-700 border border-pink-200",
  "Alat Kantor": "bg-amber-100 text-amber-700 border border-amber-200",
  Transport: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  Konsumsi: "bg-success/10 text-success border border-success/20",
  "Lain-lain": "bg-secondary text-ash border border-hairline",
};

export default function BiayaPage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  const { expenses } = useSupabaseData();
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
  const totalFeeMP = sorted.filter((e) => e.kategori === "Fee Marketplace").reduce((s, e) => s + e.jumlah, 0);
  const totalOps = totalAll - totalFeeMP;

  return (
    <div>
      <PageHeader
        title="Biaya"
        subtitle="Catat semua pengeluaran & biaya operasional"
      />

      {/* Stat cards — samain style dengan dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
        <StatCard
          title="Total Semua"
          value={formatRupiah(totalAll)}
          icon={Receipt}
          color="primary"
        />
        <StatCard
          title="Fee Marketplace"
          value={formatRupiah(totalFeeMP)}
          icon={Tag}
          color="sky"
        />
        <StatCard
          title="Operasional"
          value={formatRupiah(totalOps)}
          icon={Briefcase}
          color="emerald"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
          <Input
            placeholder="Cari keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 px-3 rounded-sm border border-hairline-strong bg-surface-card text-sm text-ink"
        >
          <option value="all">Semua Kategori</option>
          {KATEGORI_BIAYA.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada biaya" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block rounded-sm bg-surface-card shadow-card overflow-hidden">
            <div className="px-4 py-2 border-b border-hairline bg-surface/30 text-xs flex justify-between text-ash">
              <span>Menampilkan {filtered.length} dari {sorted.length} entri</span>
              <span className="font-mono font-semibold text-ink">
                Total: {formatRupiah(filtered.reduce((s, e) => s + e.jumlah, 0))}
              </span>
            </div>
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
                    <TableCell className="text-ash">{formatDate(e.tanggal)}</TableCell>
                    <TableCell>
                      <Badge className={KAT_COLORS[e.kategori] || ""}>{e.kategori}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{e.keterangan}</TableCell>
                    <TableCell className="text-right font-semibold text-ink">
                      {formatRupiah(e.jumlah)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((e) => (
              <div key={e.id} className="rounded-sm bg-surface-card shadow-card overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-hairline/40 bg-surface/30">
                  <span className="text-[10px] font-mono text-ash whitespace-nowrap">
                    {formatDate(e.tanggal)}
                  </span>
                  <Badge className={KAT_COLORS[e.kategori] || ""}>{e.kategori}</Badge>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-ash font-semibold leading-none">
                      Keterangan
                    </p>
                    <p className="text-sm font-bold text-ink mt-1 break-words">
                      {e.keterangan}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-ink shrink-0 whitespace-nowrap">
                    {formatRupiah(e.jumlah)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
