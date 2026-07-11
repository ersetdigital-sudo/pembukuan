"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { MONTHS } from "@/lib/constants";

export default function MonthPicker({ month, year, onChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [m, setM] = useState(month ?? "all");
  const [y, setY] = useState(String(year));

  useEffect(() => {
    setM(month ?? "all");
    setY(String(year));
  }, [month, year]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));
  const monthLabel =
    m === "all" ? "Semua Bulan" : (MONTHS[Number(m)] ?? "Bulan");

  const handleChange = (newM, newY) => {
    setM(newM);
    setY(newY);
    if (onChange) onChange(newM, newY);
    // Also push to URL
    const params = new URLSearchParams(search?.toString());
    if (newM) params.set("m", newM); else params.delete("m");
    if (newY) params.set("y", newY); else params.delete("y");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3">
      <Select
        value={m}
        onValueChange={(v) => handleChange(v, y)}
        className="w-full sm:w-44"
      >
        <SelectTrigger>
          <SelectValue placeholder="Bulan">{monthLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {MONTHS.map((name, i) => (
            <SelectItem key={i} value={String(i)}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={y}
        onValueChange={(v) => handleChange(m, v)}
        className="w-full sm:w-32"
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((yr) => (
            <SelectItem key={yr} value={yr}>{yr}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
