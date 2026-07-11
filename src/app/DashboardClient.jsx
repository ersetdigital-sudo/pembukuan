"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, TrendingUp, Receipt, DollarSign, Package } from "lucide-react";

// Force dynamic rendering (uses URL search params)
export const dynamic = "force-dynamic";

import PageHeader from "@/components/layout/PageHeader";
import MonthPicker from "@/components/dashboard/MonthPicker";
import StatCard from "@/components/dashboard/StatCard";
import ComparisonIndicator from "@/components/dashboard/ComparisonIndicator";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import TopProducts from "@/components/dashboard/TopProducts";
import TopCustomers from "@/components/dashboard/TopCustomers";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ProfitSharingCard from "@/components/dashboard/ProfitSharingCard";

import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSettings } from "@/hooks/useSettings";
import { formatRupiah, formatNumber, formatPercent } from "@/lib/utils/format";
import { MONTHS } from "@/lib/constants";
import {
  getSaleTotals,
  getSaleProducts,
  makeProfitBersihFn,
  aggregateByMarketplace,
  aggregateByProduct,
  aggregateByCustomer,
  computeProfitSharing,
} from "@/lib/utils/sale";

export default function DashboardPage() {
  const params = useSearchParams();
  const month = params?.get("m") ?? "all";
  const year = params?.get("y") ?? String(new Date().getFullYear());

  const data = useSupabaseData();
  const { sales, expenses, incomes } = data;
  const { profitSharing: sharingConfig } = useSettings();

  // Filtered sales & expenses for the selected period
  const periodSales = useMemo(
    () =>
      sales.filter((s) => {
        if (!s.tanggal) return false;
        const d = new Date(s.tanggal);
        if (d.getFullYear() !== Number(year)) return false;
        if (month !== "all" && d.getMonth() !== Number(month)) return false;
        return true;
      }),
    [sales, year, month]
  );

  const periodExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        if (!e.tanggal) return false;
        const d = new Date(e.tanggal);
        if (d.getFullYear() !== Number(year)) return false;
        if (month !== "all" && d.getMonth() !== Number(month)) return false;
        return true;
      }),
    [expenses, year, month]
  );

  const periodIncomes = useMemo(
    () =>
      incomes.filter((i) => {
        if (!i.tanggal) return false;
        const d = new Date(i.tanggal);
        if (d.getFullYear() !== Number(year)) return false;
        if (month !== "all" && d.getMonth() !== Number(month)) return false;
        return true;
      }),
    [incomes, year, month]
  );

  // Previous period for comparison
  const prevSales = useMemo(() => {
    if (month === "all") {
      return sales.filter((s) => {
        if (!s.tanggal) return false;
        return new Date(s.tanggal).getFullYear() === Number(year) - 1;
      });
    }
    const prevDate = new Date(Number(year), Number(month) - 1, 1);
    prevDate.setMonth(prevDate.getMonth() - 1);
    return sales.filter((s) => {
      if (!s.tanggal) return false;
      const d = new Date(s.tanggal);
      return d.getFullYear() === prevDate.getFullYear() && d.getMonth() === prevDate.getMonth();
    });
  }, [sales, year, month]);

  const profitFn = useMemo(
    () => makeProfitBersihFn(periodSales, periodExpenses),
    [periodSales, periodExpenses]
  );
  const prevProfitFn = useMemo(
    () => makeProfitBersihFn(prevSales, periodExpenses /* approximation */),
    [prevSales, periodExpenses]
  );

  // KPIs
  const totalPenjualan = periodSales.reduce((sum, s) => sum + getSaleTotals(s).totalJual, 0);
  const totalProfit = periodSales.reduce((sum, s) => sum + profitFn(s), 0);
  const totalFeeMP = periodSales.reduce((sum, s) => sum + (s.fee_mp || 0), 0);
  const totalBiaya = periodExpenses.reduce((sum, e) => sum + (e.jumlah || 0), 0);
  const totalQty = periodSales.reduce((sum, s) => sum + getSaleTotals(s).totalQty, 0);
  const totalPemasukanLain = periodIncomes.reduce((sum, i) => sum + (i.jumlah || 0), 0);
  const netProfit = totalProfit + totalPemasukanLain;

  const prevPenjualan = prevSales.reduce((sum, s) => sum + getSaleTotals(s).totalJual, 0);
  const prevProfit = prevSales.reduce((sum, s) => sum + prevProfitFn(s), 0);
  const prevBiaya = totalBiaya; // approximation: same period expenses
  const prevNet = prevProfit;

  // Monthly bar chart data — for the selected year, all 12 months
  const monthlyData = useMemo(() => {
    return MONTHS.map((name, idx) => {
      const ms = sales.filter((s) => {
        if (!s.tanggal) return false;
        const d = new Date(s.tanggal);
        return d.getFullYear() === Number(year) && d.getMonth() === idx;
      });
      const me = expenses.filter((e) => {
        if (!e.tanggal) return false;
        const d = new Date(e.tanggal);
        return d.getFullYear() === Number(year) && d.getMonth() === idx;
      });
      const profitFnLocal = makeProfitBersihFn(ms, me);
      const penjualan = ms.reduce((sum, s) => sum + getSaleTotals(s).totalJual, 0);
      const profit = ms.reduce((sum, s) => sum + profitFnLocal(s), 0);
      const biaya = me.reduce((sum, e) => sum + (e.jumlah || 0), 0);
      return { name: name.slice(0, 3), penjualan, profit, biaya };
    });
  }, [sales, expenses, year]);

  // Marketplace breakdown (donut)
  const mpMap = useMemo(
    () => aggregateByMarketplace(periodSales, profitFn),
    [periodSales, profitFn]
  );
  const mpData = Object.entries(mpMap)
    .filter(([, v]) => v.qty > 0)
    .sort((a, b) => b[1].profit - a[1].profit)
    .map(([name, v]) => ({
      name,
      value: Math.round(v.profit),
      pct: totalProfit > 0 ? Math.round((v.profit / totalProfit) * 100) : 0,
    }));

  // Kategori produk breakdown — using per-product categorization
  const catMap = useMemo(() => {
    const map = { Plugin: 0, Jasa: 0 };
    periodSales.forEach((s) => {
      const produk = getSaleProducts(s);
      const saleProfit = profitFn(s);
      const totalQty = produk.reduce((sum, p) => sum + p.qty, 0);
      const perUnitProfit = totalQty > 0 ? saleProfit / totalQty : 0;
      produk.forEach((p) => {
        const k = (p.kategori_produk || "").toLowerCase() === "jasa" ? "Jasa" : "Plugin";
        map[k] += perUnitProfit * p.qty;
      });
    });
    return map;
  }, [periodSales, profitFn]);
  const catData = Object.entries(catMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
      pct: totalProfit > 0 ? Math.round((value / totalProfit) * 100) : 0,
    }));

  // Top products
  const productList = useMemo(
    () => aggregateByProduct(periodSales, profitFn).sort((a, b) => b[1].qty - a[1].qty),
    [periodSales, profitFn]
  );

  // Top customers
  const customerList = useMemo(
    () => aggregateByCustomer(periodSales, profitFn).sort((a, b) => b[1].total - a[1].total),
    [periodSales, profitFn]
  );

  // Recent transactions
  const recentSales = useMemo(
    () =>
      [...periodSales]
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
        .slice(0, 5)
        .map((s) => ({ ...s, __totals: getSaleTotals(s) })),
    [periodSales]
  );

  // Profit sharing
  const sharing = useMemo(
    () => computeProfitSharing(periodSales, profitFn, [], sharingConfig),
    [periodSales, profitFn, sharingConfig]
  );

  const periodLabel =
    month === "all"
      ? `Tahun ${year}`
      : `${MONTHS[Number(month)]} ${year}`;
  const prevLabel =
    month === "all"
      ? `Tahun ${Number(year) - 1}`
      : `${MONTHS[(Number(month) + 11) % 12]} ${month === "0" ? Number(year) - 1 : year}`;

  return (
    <div>
      <PageHeader
        title="Sales Recap"
        subtitle={`Ringkasan bisnis OOS SHOP — ${periodLabel}`}
      >
        <MonthPicker month={month} year={year} />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <StatCard
          title="Total Penjualan"
          value={formatRupiah(totalPenjualan)}
          sub={`${formatNumber(totalQty)} unit terjual`}
          icon={ShoppingCart}
          color="primary"
        />
        <StatCard
          title="Total Profit"
          value={formatRupiah(totalProfit)}
          sub={`Untung ${formatPercent(totalPenjualan > 0 ? (totalProfit / totalPenjualan) * 100 : 0).replace('.', ',')} dari total penjualan`}
          icon={TrendingUp}
          color="emerald"
          valueClass={totalProfit >= 0 ? "text-success" : "text-danger"}
        />
        <StatCard
          title="Total Biaya"
          value={formatRupiah(totalBiaya)}
          sub={`${(totalPenjualan > 0 ? (totalFeeMP / totalPenjualan) * 100 : 0).toFixed(1).replace('.', ',')}% dari penjualan`}
          icon={Receipt}
          color="secondary"
        />
      </div>



      {/* Chart */}
      <div className="mb-4">
        <RevenueChart
          data={monthlyData}
          title={`Tren Bulanan ${year}`}
          subtitle="Penjualan, profit, dan biaya tiap bulan"
        />
      </div>

      {/* Donut charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <CategoryChart
          data={catData}
          title="Profit per Kategori"
          subtitle="Plugin vs Jasa"
        />
        <CategoryChart
          data={mpData}
          title="Profit per Marketplace"
          subtitle="Distribusi profit bersih"
        />
      </div>

      {/* Top products + Top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <TopProducts items={productList} limit={5} />
        <TopCustomers items={customerList} limit={5} />
      </div>

      {/* Recent transactions + Profit sharing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <RecentTransactions items={recentSales} limit={5} />
        </div>
        <ProfitSharingCard sharing={sharing} periodLabel={periodLabel} />
      </div>
    </div>
  );
}

function ComparisonBlock({ label, current, previous, prevLabel, reverse = false }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card px-3 py-2 flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-ash truncate leading-none">
          {label} <span className="text-ash font-normal normal-case">vs {prevLabel}</span>
        </p>
        <p className="font-mono text-sm font-bold text-ink leading-tight mt-1">{formatRupiah(current)}</p>
      </div>
      <ComparisonIndicator
        current={current}
        previous={previous}
        label=""
        reverse={reverse}
      />
    </div>
  );
}
