"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, TrendingUp, Wallet, Receipt, DollarSign, Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Force dynamic rendering (uses URL search params)
export const dynamic = "force-dynamic";

import PageHeader from "@/components/layout/PageHeader";
import MonthPicker from "@/components/dashboard/MonthPicker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import IklanFormDialog from "@/components/laporan/IklanFormDialog";

import { useSupabaseData, invalidateCache } from "@/hooks/useSupabaseData";
import { fetchTable, insertRow, updateRow, deleteRow } from "@/lib/supabase/api";
import { formatRupiah, formatRupiahShort, formatNumber } from "@/lib/utils/format";
import { MONTHS, MARKETPLACES, CHART_COLORS, MP_BADGE } from "@/lib/constants";
import { makeProfitBersihFn, aggregateByMarketplace, aggregateByProduct, computeProfitSharing } from "@/lib/utils/sale";

export default function LaporanPage() {
  const params = useSearchParams();
  const month = params?.get("m") ?? String(new Date().getMonth());
  const year = params?.get("y") ?? String(new Date().getFullYear());
  const { toast } = useToast();

  const {
    sales,
    expenses,
    incomes,
    iklans: dbIklans,
  } = useSupabaseData();

  // Local state for iklans (allows add/edit/delete in this session)
  const [iklans, setIklans] = useState([]);
  useEffect(() => { setIklans(dbIklans); }, [dbIklans]);

  // Iklan dialog state
  const [iklanDialogOpen, setIklanDialogOpen] = useState(false);
  const [iklanEditData, setIklanEditData] = useState(null);
  const [iklanDeleteId, setIklanDeleteId] = useState(null);
  const [iklanSaving, setIklanSaving] = useState(false);

  // Helper — does the entry fall in the current year/month filter?
  const inPeriod = useCallback(
    (tanggal) => {
      if (!tanggal) return false;
      const d = new Date(tanggal);
      if (d.getFullYear() !== Number(year)) return false;
      if (month !== "all" && d.getMonth() !== Number(month)) return false;
      return true;
    },
    [year, month]
  );

  const periodSales = useMemo(
    () =>
      sales.filter((s) => {
        if (!s.tanggal) return false;
        return inPeriod(s.tanggal);
      }),
    [sales, inPeriod]
  );
  const periodExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        if (!e.tanggal) return false;
        return inPeriod(e.tanggal);
      }),
    [expenses, inPeriod]
  );
  const periodIncomes = useMemo(
    () =>
      incomes.filter((i) => {
        if (!i.tanggal) return false;
        return inPeriod(i.tanggal);
      }),
    [incomes, inPeriod]
  );
  const periodIklans = useMemo(
    () => iklans.filter((i) => inPeriod(i.tanggal)).sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [iklans, inPeriod]
  );

  const profitFn = useMemo(
    () => makeProfitBersihFn(periodSales, periodExpenses),
    [periodSales, periodExpenses]
  );

  const totalLaba = periodSales.reduce((sum, s) => sum + profitFn(s), 0);
  const totalFeeMP = periodSales.reduce((sum, s) => sum + (s.fee_mp || 0), 0);
  const totalBiayaLain = periodExpenses.reduce((sum, e) => sum + (e.jumlah || 0), 0);
  const biayaNonFeeMP = periodExpenses
    .filter((e) => e.kategori !== "Fee Marketplace")
    .reduce((sum, e) => sum + (e.jumlah || 0), 0);
  const totalPemasukanLain = periodIncomes.reduce((sum, i) => sum + (i.jumlah || 0), 0);
  const netProfit = totalLaba + totalPemasukanLain;

  // Biaya iklan (period-filtered, per-kategori)
  const totalIklan = periodIklans.reduce((s, e) => s + (e.jumlah || 0), 0);

  // Marketplace aggregation
  const mpMap = useMemo(() => aggregateByMarketplace(periodSales, profitFn), [periodSales, profitFn]);
  const mpPieData = Object.entries(mpMap)
    .filter(([, v]) => v.profit > 0)
    .sort((a, b) => b[1].profit - a[1].profit)
    .map(([name, v]) => ({ name, value: Math.round(v.profit) }));
  const mpPieTotal = mpPieData.reduce((s, d) => s + d.value, 0);
  const mpPieNamed = mpPieData.map((d) => ({
    ...d,
    pct: mpPieTotal > 0 ? (d.value / mpPieTotal) * 100 : 0,
    color: CHART_COLORS[mpPieData.indexOf(d) % CHART_COLORS.length],
  }));

  // Top products
  const productList = useMemo(
    () => aggregateByProduct(periodSales, profitFn).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10),
    [periodSales, profitFn]
  );

  // Profit sharing (Iklan now reduces per-bucket profit BEFORE the Andri/Asrud split)
  const sharing = useMemo(
    () => computeProfitSharing(periodSales, profitFn, periodIklans),
    [periodSales, profitFn, periodIklans]
  );

  // Marketplace totals (precomputed so the table footer doesn't need an inline IIFE)
  const mpTotals = useMemo(() => {
    const t = MARKETPLACES.reduce(
      (acc, mp) => ({
        qty: acc.qty + (mpMap[mp]?.qty || 0),
        fee: acc.fee + (mpMap[mp]?.fee || 0),
        profit: acc.profit + (mpMap[mp]?.profit || 0),
      }),
      { qty: 0, fee: 0, profit: 0 }
    );
    return t;
  }, [mpMap]);
  // Only list marketplaces that actually have activity in this period
  const activeMarketplaces = useMemo(
    () => MARKETPLACES.filter((mp) => (mpMap[mp]?.qty || 0) > 0 || (mpMap[mp]?.profit || 0) !== 0),
    [mpMap]
  );

  // Chart data — daily when a specific month is picked, yearly when 'all'
  const monthlyData = useMemo(() => {
    const yNum = Number(year);
    const inYear = (d) => d.getFullYear() === yNum;

    if (month !== "all") {
      // Daily view: 1 day per entry for the selected month
      const mNum = Number(month);
      const daysInMonth = new Date(yNum, mNum + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const inDay = (d) =>
          inYear(d) && d.getMonth() === mNum && d.getDate() === day;
        const ms = sales.filter((s) => s.tanggal && inDay(new Date(s.tanggal)));
        const me = expenses.filter((e) => e.tanggal && inDay(new Date(e.tanggal)));
        const mi = incomes.filter((inc) => inc.tanggal && inDay(new Date(inc.tanggal)));
        const profitFnLocal = makeProfitBersihFn(ms, me);
        return {
          name: String(day),
          laba: Math.round(ms.reduce((sum, s) => sum + profitFnLocal(s), 0)),
          pemasukan: Math.round(mi.reduce((sum, inc) => sum + inc.jumlah, 0)),
          biaya: Math.round(me.reduce((sum, e) => sum + e.jumlah, 0)),
        };
      });
    }

    // Yearly view: 12 months
    return MONTHS.map((name, idx) => {
      const ms = sales.filter((s) => s.tanggal && inYear(new Date(s.tanggal)) && new Date(s.tanggal).getMonth() === idx);
      const me = expenses.filter((e) => e.tanggal && inYear(new Date(e.tanggal)) && new Date(e.tanggal).getMonth() === idx);
      const profitFnLocal = makeProfitBersihFn(ms, me);
      return {
        name: name.slice(0, 3),
        laba: Math.round(ms.reduce((sum, s) => sum + profitFnLocal(s), 0)),
        pemasukan: Math.round(
          incomes
            .filter((i) => i.tanggal && inYear(new Date(i.tanggal)) && new Date(i.tanggal).getMonth() === idx)
            .reduce((sum, i) => sum + i.jumlah, 0)
        ),
        biaya: Math.round(me.reduce((sum, e) => sum + e.jumlah, 0)),
      };
    });
  }, [sales, expenses, incomes, year, month]);

  const isYearly = month === "all";

  // Bar-chart series toggle state — lets user focus on one metric at a time so the
  // daily view (28-31 days × 3 bars) doesn't get cramped.
  const [activeSeries, setActiveSeries] = useState({ laba: true, pemasukan: true, biaya: true });
  const visibleCount = [activeSeries.laba, activeSeries.pemasukan, activeSeries.biaya].filter(Boolean).length;
  const toggleSeries = (key) =>
    setActiveSeries((prev) => {
      // Keep at least one active so the chart never goes empty
      const next = { ...prev, [key]: !prev[key] };
      const remaining = Object.values(next).filter(Boolean).length;
      return remaining === 0 ? prev : next;
    });

  // Aggregate totals for the active series (used by the header subtitle)
  const sumLaba = monthlyData.reduce((s, d) => s + d.laba, 0);
  const sumPemasukan = monthlyData.reduce((s, d) => s + d.pemasukan, 0);
  const sumBiaya = monthlyData.reduce((s, d) => s + d.biaya, 0);

  const periodLabel =
    month === "all" ? `Tahun ${year}` : `${MONTHS[Number(month)]} ${year}`;

  // ── Iklan handlers ─────────────────────────────────────────────
  const openIklanTambah = () => {
    setIklanEditData(null);
    setIklanDialogOpen(true);
  };

  const openIklanEdit = (item) => {
    setIklanEditData(item);
    setIklanDialogOpen(true);
  };

  const closeIklanDialog = () => {
    if (iklanSaving) return;
    setIklanDialogOpen(false);
    setIklanEditData(null);
  };

  const handleIklanSave = async (data) => {
    setIklanSaving(true);
    let error = null;

    if (iklanEditData) {
      const res = await updateRow("iklans", iklanEditData.id, data);
      error = res.error;
      if (!error && res.data) {
        setIklans((prev) =>
          prev.map((i) => (i.id === iklanEditData.id ? res.data : i))
        );
        toast.success("Biaya iklan berhasil diperbarui");
      } else {
        setIklans((prev) =>
          prev.map((i) =>
            i.id === iklanEditData.id
              ? { ...i, ...data, id: iklanEditData.id }
              : i
          )
        );
        toast({
          title: "Gagal memperbarui di server",
          description: error?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } else {
      const newIklan = {
        id: `ikl-${Date.now()}`,
        ...data,
        created_by: "demo@oosshop.id",
      };
      const res = await insertRow("iklans", newIklan);
      error = res.error;
      if (!error && res.data) {
        setIklans((prev) => [res.data, ...prev]);
        toast.success("Biaya iklan berhasil ditambahkan");
      } else {
        setIklans((prev) => [newIklan, ...prev]);
        toast({
          title: "Gagal menambahkan ke server",
          description: error?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    }

    if (!error) {
      invalidateCache();
    }
    setIklanSaving(false);
    setIklanDialogOpen(false);
    setIklanEditData(null);
  };

  const performIklanDelete = async () => {
    if (!iklanDeleteId) return;

    // Optimistic local remove
    setIklans((prev) => prev.filter((i) => i.id !== iklanDeleteId));

    const { error } = await deleteRow("iklans", iklanDeleteId);
    if (!error) {
      invalidateCache();
      toast.success("Biaya iklan berhasil dihapus");
    } else {
      toast({
        title: "Gagal menghapus dari server",
        description:
          error.message || "Data terhapus di tampilan lokal, coba refresh halaman.",
        variant: "destructive",
      });
    }
    setIklanDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle={`Rekap keuangan — ${periodLabel}`}
      >
        <MonthPicker month={month} year={year} />
        <Button
          variant="outline"
          onClick={() =>
            exportToPDF({
              periodLabel,
              totalLaba,
              totalPemasukanLain,
              totalBiayaLain,
              netProfit,
              totalFeeMP,
              biayaNonFeeMP,
              mpMap,
              productList,
              sharing,
            })
          }
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard
          title="Total Profit Penjualan"
          value={formatRupiah(totalLaba)}
          icon={TrendingUp}
          tone="emerald"
        />
        <KpiCard
          title="Pemasukan Lain"
          value={formatRupiah(totalPemasukanLain)}
          icon={Wallet}
          tone="sky"
        />
        <KpiCard
          title="Total Biaya"
          value={formatRupiah(totalBiayaLain)}
          icon={Receipt}
          tone="secondary"
        />
        <KpiCard
          title="Net Profit"
          value={formatRupiah(netProfit)}
          icon={DollarSign}
          tone="plugin"
        />
      </div>

      {/* Fee breakdown */}
      <div className="mb-6 text-xs text-muted bg-surface-2 rounded-md border border-border px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Biaya:{" "}
          <span className="text-secondary font-semibold">
            Fee MP {formatRupiah(totalFeeMP)}
          </span>{" "}
          |{" "}
          <span className="text-ink font-semibold">
            Operasional {formatRupiah(biayaNonFeeMP)}
          </span>
        </span>
      </div>

      {/* Profit sharing: Plugin + Jasa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ProfitCard
          tone="plugin"
          kicker="Kategori Plugin"
          totalLabel="Total Profit Bersih"
          total={sharing.profitPlugin}
          buckets={[
            { pct: 40, label: "Andri", value: sharing.pluginAndri },
            { pct: 40, label: "Asrud", value: sharing.pluginAsrud },
            { pct: 20, label: "Modal & Dev", value: sharing.pluginModal },
          ]}
        />
        <ProfitCard
          tone="success"
          kicker="Kategori Jasa"
          totalLabel="Total Profit Bersih"
          total={sharing.profitJasa}
          buckets={[
            { pct: 40, label: "Andri", value: sharing.jasaAndri },
            { pct: 60, label: "Asrud", value: sharing.jasaAsrud },
          ]}
        />
      </div>

      {/* Rekap Transfer */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="font-display text-base font-bold text-ink">Rekap Transfer</h2>
          <p className="text-xs text-muted mt-0.5">
            Ringkasan jumlah yang harus ditransfer ke masing-masing orang
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TransferCard
            name="Andri"
            total={sharing.transferAndri}
            details={[
              { label: "Plugin (40%)", value: sharing.pluginAndri },
              { label: "Jasa (40%)", value: sharing.jasaAndri },
            ]}
          />
          <TransferCard
            name="Asrud"
            total={sharing.transferAsrud}
            details={[
              { label: "Plugin (40%)", value: sharing.pluginAsrud },
              { label: "Jasa (60%)", value: sharing.jasaAsrud },
              { label: "Modal & Dev Plugin (20%)", value: sharing.pluginModal },
            ]}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  {isYearly
                    ? `Grafik Bulanan (${year})`
                    : `Grafik Harian — ${MONTHS[Number(month)]} ${year}`}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted">
                  {visibleCount === 1 && activeSeries.laba && `Total Profit ${formatRupiahShort(sumLaba)}`}
                  {visibleCount === 1 && activeSeries.pemasukan && `Total Pemasukan ${formatRupiahShort(sumPemasukan)}`}
                  {visibleCount === 1 && activeSeries.biaya && `Total Biaya ${formatRupiahShort(sumBiaya)}`}
                  {visibleCount > 1 && (isYearly ? "Klik chip untuk fokus ke 1 metrik" : "Tip: klik chip biar bar lebih lega")}
                </p>
              </div>
              {/* Series toggle chips — replace default legend */}
              <div className="flex flex-wrap gap-1.5">
                <SeriesChip
                  label="Profit"
                  color="primary"
                  active={activeSeries.laba}
                  onClick={() => toggleSeries("laba")}
                />
                <SeriesChip
                  label="Pemasukan"
                  color="success"
                  active={activeSeries.pemasukan}
                  onClick={() => toggleSeries("pemasukan")}
                />
                <SeriesChip
                  label="Biaya"
                  color="secondary"
                  active={activeSeries.biaya}
                  onClick={() => toggleSeries("biaya")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={1} barCategoryGap={visibleCount === 1 ? "32%" : "22%"} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="labaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="pemasukanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--color-success))" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgb(var(--color-success))" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="biayaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--color-secondary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgb(var(--color-secondary))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  {/* No CartesianGrid — modern charts breathe without gridlines */}
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isYearly ? 11 : 10, fill: "rgb(var(--color-muted))" }}
                    axisLine={false}
                    tickLine={false}
                    interval={isYearly ? 0 : Math.ceil(monthlyData.length / 12)}
                    dy={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }}
                    tickFormatter={formatRupiahShort}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgb(var(--color-muted) / 0.06)" }}
                    labelFormatter={(label) =>
                      isYearly
                        ? label
                        : `${label} ${MONTHS[Number(month)]} ${year}`
                    }
                  />
                  {activeSeries.laba && (
                    <Bar
                      dataKey="laba"
                      name="Profit"
                      fill="url(#labaGrad)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={650}
                      activeBar={{ stroke: "rgb(var(--color-primary))", strokeWidth: 1.5 }}
                    />
                  )}
                  {activeSeries.pemasukan && (
                    <Bar
                      dataKey="pemasukan"
                      name="Pemasukan"
                      fill="url(#pemasukanGrad)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={650}
                      activeBar={{ stroke: "rgb(var(--color-success))", strokeWidth: 1.5 }}
                    />
                  )}
                  {activeSeries.biaya && (
                    <Bar
                      dataKey="biaya"
                      name="Biaya"
                      fill="url(#biayaGrad)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={650}
                      activeBar={{ stroke: "rgb(var(--color-secondary))", strokeWidth: 1.5 }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit per Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            {mpPieData.length === 0 ? (
              <p className="text-sm text-muted text-center py-12">Belum ada data</p>
            ) : (
              <>
                <div className="relative h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mpPieNamed}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={82}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="rgb(var(--color-surface-2))"
                        strokeWidth={2}
                        label={renderPieLabel}
                        labelLine={false}
                        isAnimationActive
                        animationDuration={650}
                      >
                        {mpPieNamed.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label overlay */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      Total
                    </span>
                    <span className="font-display text-sm font-extrabold text-ink leading-tight">
                      {formatRupiahShort(mpPieTotal)}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted">
                      {mpPieNamed.length} marketplace
                    </span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {mpPieNamed.map((d) => (
                    <li
                      key={d.name}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="truncate text-xs font-semibold text-ink">{d.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[10px] font-bold tabular-nums text-muted">
                          {d.pct.toFixed(1)}%
                        </span>
                        <span className="w-20 text-right font-mono text-xs font-bold tabular-nums text-ink">
                          {formatRupiahShort(d.value)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biaya Iklan */}
      <section className="mb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-plugin" /> Biaya Iklan
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Mengurangi profit bersih kategori sebelum dibagi ke partner
            </p>
          </div>
          <Button variant="plugin" size="sm" onClick={openIklanTambah}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>

        {/* Per-kategori breakdown badges (hanya muncul kalau ada iklan di periode ini) */}
        {totalIklan > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-md border border-plugin/20 bg-plugin-soft/40 px-3 py-1.5 text-xs">
              <span className="text-muted">Iklan Plugin</span>
              <span className="font-display font-bold tabular-nums text-plugin">
                {formatRupiah(sharing.iklanPlugin)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-success/20 bg-success/5 px-3 py-1.5 text-xs">
              <span className="text-muted">Iklan Jasa</span>
              <span className="font-display font-bold tabular-nums text-success">
                {formatRupiah(sharing.iklanJasa)}
              </span>
            </div>
          </div>
        )}

        <Card>
          {periodIklans.length === 0 ? (
            <EmptyState message="Belum ada biaya iklan di periode ini" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodIklans.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted whitespace-nowrap">
                      {formatDateId(e.tanggal)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          e.kategori === "Plugin"
                            ? "bg-plugin-soft text-plugin border border-plugin/20"
                            : "bg-success/15 text-success border border-success/30"
                        }
                      >
                        {e.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted truncate max-w-[200px]">
                      {e.keterangan || "—"}
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-secondary tabular-nums">
                      {formatRupiah(e.jumlah)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          aria-label="Edit iklan"
                          onClick={() => openIklanEdit(e)}
                          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-surface hover:text-ink transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus iklan"
                          onClick={() => setIklanDeleteId(e.id)}
                          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-secondary/5 hover:bg-secondary/5">
                  <TableCell colSpan={3} className="font-bold text-secondary text-xs uppercase tracking-wider">
                    Total Biaya Iklan
                  </TableCell>
                  <TableCell className="text-right font-display font-extrabold text-secondary tabular-nums">
                    {formatRupiah(totalIklan)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* Pemasukan Tambahan */}
      <section className="mb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Pemasukan Tambahan</h2>
            <p className="text-xs text-muted mt-0.5">
              Pemasukan di luar penjualan marketplace
            </p>
          </div>
          <Button variant="plugin" size="sm" onClick={() => alert("Tambah Pemasukan Tambahan (stub)")}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>
        <Card>
          {periodIncomes.length === 0 ? (
            <EmptyState message="Belum ada pemasukan tambahan" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodIncomes.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-muted">{formatDateId(i.tanggal)}</TableCell>
                    <TableCell className="font-medium">{i.keterangan}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatRupiah(i.jumlah)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5 text-muted">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => alert("Edit (stub)")}
                          className="grid h-7 w-7 place-items-center rounded hover:bg-surface-2 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus"
                          onClick={() => alert("Hapus (stub)")}
                          className="grid h-7 w-7 place-items-center rounded hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-plugin-soft/40 hover:bg-plugin-soft/40">
                  <TableCell colSpan={2} className="font-bold text-plugin">
                    Total Pemasukan Tambahan
                  </TableCell>
                  <TableCell className="text-right font-bold text-plugin">
                    {formatRupiah(totalPemasukanLain)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* Marketplace detail + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between gap-3">
              <CardTitle>Detail per Marketplace</CardTitle>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {activeMarketplaces.length} aktif
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeMarketplaces.length === 0 ? (
              <EmptyState message="Belum ada data" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marketplace</TableHead>
                    <TableHead className="text-center">Terjual</TableHead>
                    <TableHead className="text-right">Fee MP</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMarketplaces.map((mp) => {
                    const v = mpMap[mp];
                    const share = mpTotals.profit > 0 ? (v.profit / mpTotals.profit) * 100 : 0;
                    return (
                      <TableRow key={mp} className="group transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`inline-flex h-6 items-center rounded-md px-1.5 text-[10px] font-bold ${MP_BADGE[mp] || "bg-muted/20 text-muted"}`}
                            >
                              {mp.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-muted-foreground">{mp}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{formatNumber(v.qty)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-secondary font-semibold tabular-nums">
                          {v.fee > 0 ? formatRupiah(v.fee) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end leading-tight">
                            <span className="font-display font-bold tabular-nums text-muted-foreground">
                              {formatRupiah(v.profit)}
                            </span>
                            {share > 0 && (
                              <span className="text-[10px] font-semibold tabular-nums text-muted">
                                {share.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {/* Footer total — pinned at the bottom, visually separated */}
                <tfoot>
                  <TableRow className="border-t-2 border-primary/15 bg-primary/5 hover:bg-primary/5">
                    <TableCell className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      Total
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-display font-bold tabular-nums text-muted-foreground">
                        {formatNumber(mpTotals.qty)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-secondary whitespace-nowrap">
                      {formatRupiah(mpTotals.fee)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className="font-display text-base font-extrabold tabular-nums text-primary">
                        {formatRupiah(mpTotals.profit)}
                      </span>
                    </TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {productList.length === 0 ? (
              <EmptyState message="Belum ada data" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productList.map(([nama, data], i) => (
                    <TableRow key={nama}>
                      <TableCell>
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold inline-flex items-center justify-center">
                          {i + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[180px]">{nama}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{formatNumber(data.qty)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatRupiah(data.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Biaya Iklan dialogs ─────────────────────────────────────── */}
      <IklanFormDialog
        open={iklanDialogOpen}
        onOpenChange={closeIklanDialog}
        onSave={handleIklanSave}
        editData={iklanEditData}
        isSaving={iklanSaving}
      />
      <ConfirmDialog
        open={iklanDeleteId != null}
        onOpenChange={(o) => {
          if (!o) setIklanDeleteId(null);
        }}
        title="Hapus Biaya Iklan?"
        message={
          <>
            Biaya iklan ini akan dihapus dari periode aktif. Perhitungan profit
            Plugin / Jasa akan dihitung ulang tanpa nilai ini.
          </>
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={performIklanDelete}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, tone = "emerald" }) {
  const toneMap = {
    emerald: "bg-success/10 text-success",
    sky: "bg-sky-100 text-sky-600",
    secondary: "bg-secondary/10 text-secondary",
    primary: "bg-primary/10 text-primary",
    plugin: "bg-plugin/10 text-plugin",
  };
  const t = toneMap[tone] || toneMap.primary;
  return (
    <div className="group relative overflow-hidden rounded-card border border-border bg-surface-2 px-3 py-2.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card-hover">
      <div className="flex items-center gap-2.5">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${t}`}
        >
          {Icon && <Icon className="h-[18px] w-[18px]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted leading-tight">
            {title}
          </p>
          <p className="mt-0.5 truncate font-display text-[15px] font-bold text-ink leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfitCard({ tone, kicker, totalLabel, total, buckets }) {
  const isPlugin = tone === "plugin";
  const cols = buckets.length === 3 ? "grid-cols-3" : "grid-cols-2";

  const toneMap = {
    plugin: {
      bar: "bg-gradient-to-r from-plugin to-indigo-400",
      shadow: "shadow-[0_20px_40px_-12px_rgba(99,102,241,0.25)]",
      pct: "text-plugin",
      tint: "bg-plugin-soft",
      top: "bg-plugin",
    },
    success: {
      bar: "bg-gradient-to-r from-success to-emerald-400",
      shadow: "shadow-[0_20px_40px_-12px_rgba(16,185,129,0.25)]",
      pct: "text-success",
      tint: "bg-success/10",
      top: "bg-success",
    },
  };
  const t = isPlugin ? toneMap.plugin : toneMap.success;

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-100 bg-white ${t.shadow}`}>
      {/* Top gradient accent bar */}
      <div className={`h-1.5 w-full ${t.bar}`} />

      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {kicker}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-ink">
            Pembagian Profit
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted">{totalLabel}</p>
          <p className={`mt-0.5 font-display text-xl font-extrabold ${total < 0 ? "text-danger" : "text-ink"}`}>
            {formatRupiah(total)}
          </p>
        </div>
      </div>

      {/* Body — buckets */}
      <div className={`px-5 pb-5 grid ${cols} gap-3`}>
        {buckets.map((b) => (
          <Bucket key={b.label} pct={b.pct} label={b.label} value={b.value} tone={t} />
        ))}
      </div>
    </div>
  );
}

function Bucket({ pct, label, value, tone }) {
  const positive = value >= 0;
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-100 ${tone.tint} p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}>
      {/* Colored top strip */}
      <div className={`h-1 w-full absolute top-0 left-0 ${tone.top}`} />
      <p className={`font-display text-3xl font-black leading-none ${tone.pct}`}>{pct}%</p>
      <p className="mt-2.5 text-sm font-bold text-ink">{label}</p>
      <div className="mt-2 inline-flex items-center rounded-full bg-white px-2.5 py-1 shadow-sm border border-slate-100">
        <span className={`font-mono text-xs font-semibold ${positive ? "text-ink" : "text-danger"}`}>
          {formatRupiah(value)}
        </span>
      </div>
    </div>
  );
}

function TransferCard({ name, total, details }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_40px_-12px_rgba(99,102,241,0.15)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-plugin to-indigo-400" />

      <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Transfer ke
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-ink">
            {name}
          </h3>
        </div>
        <p className="font-display text-2xl font-extrabold shrink-0 text-ink">
          {formatRupiah(total)}
        </p>
      </div>
      <ul className="px-5 pb-5 space-y-2">
        {details.map((d) => (
          <li key={d.label} className="flex justify-between items-center text-sm">
            <span className="text-muted">{d.label}</span>
            <span className="font-mono font-semibold text-ink">{formatRupiah(d.value)}</span>
          </li>
        ))}
        <li className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-100">
          <span>Total</span>
          <span className="font-mono text-ink">{formatRupiah(total)}</span>
        </li>
      </ul>
    </div>
  );
}

// ── Custom chart sub-components (kept stable refs for Recharts) ───

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3 shadow-card-hover min-w-[200px]">
      <p className="mb-2 border-b border-border pb-1.5 text-xs font-bold text-ink">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
            <span className="flex-1 text-muted">{p.name}</span>
            <span className="font-mono font-semibold tabular-nums text-ink">
              {formatRupiah(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Render % label outside the donut slice — only for slices ≥ 5% to avoid clutter
function renderPieLabel({ cx, cy, midAngle, outerRadius, percent }) {
  if (!percent || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 14;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="rgb(var(--color-muted))"
      fontSize={10}
      fontWeight={700}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const d = p.payload;
  return (
    <div className="rounded-md border border-border bg-surface-2 p-3 shadow-card-hover min-w-[180px]">
      <div className="flex items-center gap-2 border-b border-border pb-1.5">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: d.color }}
        />
        <span className="text-xs font-bold text-ink">{d.name}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Profit</span>
          <span className="font-mono font-bold tabular-nums text-ink">
            {formatRupiah(p.value)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Kontribusi</span>
          <span className="font-bold tabular-nums text-primary">
            {d.pct?.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Series toggle chip for the bar chart — replaces Recharts' default legend so users
// can focus on a single metric (uncrowds the daily view). Styled as a pill: filled
// when active, ghosted when off.
function SeriesChip({ label, color, active, onClick }) {
  const colorMap = {
    primary: "rgb(var(--color-primary))",
    success: "rgb(var(--color-success))",
    secondary: "rgb(var(--color-secondary))",
  };
  const c = colorMap[color] || colorMap.primary;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all"
      style={{
        borderColor: active ? c : "rgb(var(--color-border))",
        backgroundColor: active ? `${c}` : "transparent",
        color: active ? "#fff" : "rgb(var(--color-muted))",
      }}
    >
      <span
        className="h-2 w-2 rounded-full transition-transform group-hover:scale-110"
        style={{ backgroundColor: active ? "#fff" : c }}
      />
      {label}
    </button>
  );
}

// Inline date formatter to keep this file self-contained
function formatDateId(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleDateString("id-ID", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch {
    return s;
  }
}

// ── PDF export ────────────────────────────────────────────────────
async function exportToPDF({
  periodLabel, totalLaba, totalPemasukanLain, totalBiayaLain, netProfit,
  totalFeeMP, biayaNonFeeMP, mpMap, productList, sharing,
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const PW = 210, M = 14, CW = PW - M * 2;
  const fmt = (n) => "Rp " + Math.round(Number(n)).toLocaleString("id-ID");

  const header = (y) => {
    doc.setFillColor(7, 44, 44);
    doc.roundedRect(M, y, CW, 22, 2, 2, "F");
    doc.setFontSize(15); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("OOS SHOP", M + 5, y + 9);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("Laporan Keuangan", M + 5, y + 16);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(periodLabel, PW - M - 3, y + 10, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("Periode", PW - M - 3, y + 17, { align: "right" });
    doc.setTextColor(0, 0, 0);
    return y + 28;
  };
  const sectionTitle = (y, title) => {
    doc.setFillColor(7, 44, 44);
    doc.roundedRect(M, y, CW, 8, 1, 1, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title, M + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    return y + 11;
  };
  const newPage = (y) => (y + 20 > 278 ? (doc.addPage(), 18) : y);
  const addFooter = () => {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(`Halaman ${i} dari ${total}`, PW / 2, 290, { align: "center" });
      doc.text("OOS SHOP", M, 290);
      doc.text(new Date().toLocaleDateString("id-ID"), PW - M, 290, { align: "right" });
      doc.setTextColor(0, 0, 0);
    }
  };

  let y = header(0);

  // 4-box summary
  y = sectionTitle(y, "Ringkasan Keuangan");
  const boxW = (CW - 6) / 4;
  const boxes = [
    { label: "Total Profit", val: fmt(totalLaba), c: [7, 44, 44] },
    { label: "Pemasukan Lain", val: fmt(totalPemasukanLain), c: [22, 163, 74] },
    { label: "Total Biaya", val: fmt(totalBiayaLain), c: [255, 95, 3] },
    { label: "Net Profit", val: fmt(netProfit), c: netProfit >= 0 ? [22, 163, 74] : [220, 38, 38] },
  ];
  boxes.forEach((b, i) => {
    const x = M + i * (boxW + 2);
    doc.setFillColor(245, 245, 240);
    doc.roundedRect(x, y, boxW, 18, 1.5, 1.5, "F");
    doc.setFillColor(b.c[0], b.c[1], b.c[2]);
    doc.roundedRect(x, y, boxW, 3.5, 1.5, 0, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 120);
    doc.text(b.label, x + boxW / 2, y + 8, { align: "center" });
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
    doc.setTextColor(b.c[0], b.c[1], b.c[2]);
    doc.text(b.val, x + boxW / 2, y + 15, { align: "center", maxWidth: boxW - 2 });
  });
  doc.setTextColor(0, 0, 0);
  y += 22;

  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 120);
  doc.text(`Fee Marketplace: ${fmt(totalFeeMP)}   |   Operasional: ${fmt(biayaNonFeeMP)}`, M, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Profit sharing Plugin
  y = newPage(y);
  y = sectionTitle(y, `Pembagian Profit — Plugin (Total: ${fmt(sharing.profitPlugin)})`);
  const colX = [M, M + 60, M + 100];
  ["Nama", "Porsi", "Jumlah"].forEach((h, i) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 100);
    doc.text(h, colX[i], y);
  });
  doc.setTextColor(0, 0, 0);
  y += 4;
  [
    ["Andri", "40%", fmt(sharing.pluginAndri)],
    ["Asrud", "40%", fmt(sharing.pluginAsrud)],
    ["Modal & Dev", "20%", fmt(sharing.pluginModal)],
  ].forEach(([n, p, v], i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 248, 255); doc.rect(M, y - 3, CW, 6, "F"); }
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
    doc.text(n, colX[0], y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(124, 58, 237);
    doc.text(p, colX[1], y);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    doc.text(v, colX[2], y);
    y += 6;
  });
  y += 6;

  // Profit sharing Jasa (new 40/60 split)
  y = newPage(y);
  y = sectionTitle(y, `Pembagian Profit — Jasa (Total: ${fmt(sharing.profitJasa)})`);
  ["Nama", "Porsi", "Jumlah"].forEach((h, i) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 100);
    doc.text(h, colX[i], y);
  });
  doc.setTextColor(0, 0, 0);
  y += 4;
  [
    ["Andri", "40%", fmt(sharing.jasaAndri)],
    ["Asrud", "60%", fmt(sharing.jasaAsrud)],
  ].forEach(([n, p, v], i) => {
    if (i % 2 === 0) { doc.setFillColor(240, 253, 244); doc.rect(M, y - 3, CW, 6, "F"); }
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
    doc.text(n, colX[0], y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text(p, colX[1], y);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    doc.text(v, colX[2], y);
    y += 6;
  });
  y += 6;

  // Transfer
  y = newPage(y);
  y = sectionTitle(y, "Rekap Transfer");
  const transfers = [
    {
      name: "Andri", total: sharing.transferAndri,
      rows: [["Plugin (40%)", fmt(sharing.pluginAndri)], ["Jasa (40%)", fmt(sharing.jasaAndri)]],
    },
    {
      name: "Asrud", total: sharing.transferAsrud,
      rows: [
        ["Plugin (40%)", fmt(sharing.pluginAsrud)],
        ["Jasa (60%)", fmt(sharing.jasaAsrud)],
        ["Modal & Dev Plugin (20%)", fmt(sharing.pluginModal)],
      ],
    },
  ];
  transfers.forEach((p) => {
    y = newPage(y);
    doc.setFillColor(7, 44, 44);
    doc.roundedRect(M, y - 3, CW, 8, 1, 1, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(p.name, M + 3, y + 1.5);
    doc.text(fmt(p.total), PW - M - 3, y + 1.5, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 9;
    p.rows.forEach(([l, v], i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 248, 255); doc.rect(M, y - 3, CW, 6, "F"); }
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 120); doc.text(l, M + 4, y);
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
      doc.text(v, PW - M - 3, y, { align: "right" });
      y += 6;
    });
    doc.setFillColor(220, 210, 255);
    doc.rect(M, y - 3, CW, 7, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setTextColor(7, 44, 44);
    doc.text("TOTAL TRANSFER", M + 4, y + 1);
    doc.setTextColor(124, 58, 237);
    doc.text(fmt(p.total), PW - M - 3, y + 1, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 12;
  });

  // Marketplace detail
  y = newPage(y);
  y = sectionTitle(y, "Detail per Marketplace");
  const mpCols = [M, M + 55, M + 100, M + 145];
  ["Marketplace", "Qty", "Fee", "Profit"].forEach((h, i) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(h, mpCols[i], y);
  });
  doc.setFillColor(7, 44, 44);
  doc.rect(M, y - 3, CW, 7.5, "F");
  y += 7.5;
  MARKETPLACES.forEach((mp, i) => {
    if (mpMap[mp].qty === 0) return;
    if (i % 2 === 0) { doc.setFillColor(248, 248, 255); doc.rect(M, y - 3, CW, 6.5, "F"); }
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); doc.text(mp, mpCols[0], y);
    doc.text(String(mpMap[mp].qty), mpCols[1], y);
    doc.setTextColor(234, 88, 12);
    doc.text(mpMap[mp].fee > 0 ? fmt(mpMap[mp].fee) : "-", mpCols[2], y);
    doc.setTextColor(124, 58, 237); doc.setFont("helvetica", "bold");
    doc.text(fmt(mpMap[mp].profit), mpCols[3], y);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    y += 6.5;
  });
  y += 6;

  // Top products
  y = newPage(y);
  y = sectionTitle(y, "Produk Terlaris (Top 10)");
  ["#", "Produk", "Qty", "Profit"].forEach((h, i) => {
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(h, [M, M + 10, M + 110, M + 145][i], y);
  });
  doc.setFillColor(7, 44, 44);
  doc.rect(M, y - 3, CW, 7.5, "F");
  y += 7.5;
  productList.slice(0, 10).forEach(([nama, data], i) => {
    y = newPage(y);
    if (i % 2 === 0) { doc.setFillColor(248, 248, 255); doc.rect(M, y - 3, CW, 6.5, "F"); }
    doc.setFontSize(8.5);
    doc.setTextColor(124, 58, 237); doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), M, y);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    doc.text(nama.slice(0, 40), M + 10, y);
    doc.text(String(data.qty), M + 110, y);
    doc.setTextColor(124, 58, 237); doc.setFont("helvetica", "bold");
    doc.text(fmt(data.profit), M + 145, y);
    doc.setTextColor(0, 0, 0);
    y += 6.5;
  });

  addFooter();
  doc.save(`Laporan-OOSSHOP-${periodLabel.replace(/\s/g, "_")}.pdf`);
}
