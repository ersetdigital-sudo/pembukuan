"use client";

import { useState, useEffect } from "react";
import { getMockData } from "@/lib/data/mock";
import { supabase } from "@/lib/supabase/client";
import { fetchAllData } from "@/lib/supabase/api";

// Module-level singleton cache so navigation between pages doesn't re-fetch.
let _cache = null;
let _promise = null;

/** Invalidate the global cache (call after insert/update/delete). */
export function invalidateCache() {
  _cache = null;
  _promise = null;
}

/**
 * Returns the full dataset { stocks, sales, expenses, incomes, purchases, iklans }.
 * Loads from Supabase once, then caches. Falls back to mock data on any failure.
 */
export function useSupabaseData() {
  const [data, setData] = useState(() => _cache || getMockData());
  const [loading, setLoading] = useState(() => !_cache);

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
        // already falls back inside fetchAllData, but keep mock here just in case
        setData(getMockData());
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
