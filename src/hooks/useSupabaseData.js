"use client";

import { useState, useEffect, useCallback } from "react";
import { getMockData } from "@/lib/data/mock";
import { supabase } from "@/lib/supabase/client";
import { fetchAllData } from "@/lib/supabase/api";

// Module-level singleton cache so navigation between pages doesn't re-fetch.
let _cache = null;
let _promise = null;
let _listeners = new Set();

const EMPTY_DATA = { stocks: [], sales: [], expenses: [], incomes: [], purchases: [], iklans: [] };

function _notifyListeners() {
  _listeners.forEach((fn) => fn());
}

/** Invalidate the global cache (call after insert/update/delete). */
export function invalidateCache() {
  _cache = null;
  _promise = null;
  _notifyListeners();
}

function _fetchData() {
  if (_promise) return _promise;
  _promise = fetchAllData();
  _promise
    .then((d) => {
      _cache = d;
    })
    .catch(() => {
      _cache = null;
    });
  return _promise;
}

/**
 * Returns the full dataset { stocks, sales, expenses, incomes, purchases, iklans }.
 * Loads from Supabase once, then caches. Re-fetches when cache is invalidated.
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

  const refetch = useCallback(() => {
    if (!supabase) return;
    setLoading(true);
    _fetchData()
      .then((d) => {
        setData(d);
      })
      .catch(() => {
        setData(getMockData());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // If cache exists, use it
    if (_cache) {
      setData(_cache);
      setLoading(false);
      return;
    }

    // Initial fetch
    refetch();

    // Listen for cache invalidations
    _listeners.add(refetch);
    return () => {
      _listeners.delete(refetch);
    };
  }, [refetch]);

  return { ...data, loading };
}
