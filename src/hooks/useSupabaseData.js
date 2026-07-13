"use client";

import { useState, useEffect } from "react";
import { getMockData } from "@/lib/data/mock";
import { supabase } from "@/lib/supabase/client";
import { fetchAllData } from "@/lib/supabase/api";

// Module-level singleton cache so navigation between pages doesn't re-fetch.
let _cache = null;
let _promise = null;

const EMPTY_DATA = { stocks: [], sales: [], expenses: [], incomes: [], purchases: [], iklans: [] };

/** Invalidate the global cache (call after insert/update/delete). */
export function invalidateCache() {
  _cache = null;
  _promise = null;
}

/**
 * Returns the full dataset { stocks, sales, expenses, incomes, purchases, iklans }.
 * Loads from Supabase once, then caches.
 *
 * IMPORTANT: while the real fetch is in flight, this returns EMPTY data
 * (not mock data) so the UI shows 0 / loading state instead of flashing
 * unrelated mock numbers that then "jump" to the real ones once the fetch
 * resolves. Mock data is only used as a genuine fallback — either Supabase
 * isn't configured at all (demo mode) or the fetch itself failed.
 */
export function useSupabaseData() {
  const [data, setData] = useState(() => {
    if (_cache) return _cache;
    if (!supabase) return getMockData(); // no backend configured — demo mode
    return EMPTY_DATA; // real backend configured, wait for the actual fetch
  });
  const [loading, setLoading] = useState(() => !_cache && !!supabase);

  useEffect(() => {
    if (!supabase || _cache) return;

    if (_promise) {
      _promise.then((d) => setData(d)).finally(() => setLoading(false));
      return;
    }

    _promise = fetchAllData();
    _promise
      .then((d) => {
        _cache = d;
        setData(d);
      })
      .catch(() => {
        // Genuine fetch failure — fall back to mock so the app is still usable.
        setData(getMockData());
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
