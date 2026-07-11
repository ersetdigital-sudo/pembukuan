"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { MARKETPLACES } from "@/lib/constants";

// Default profit sharing config (matches the hardcoded values)
const DEFAULT_PROFIT_SHARING = {
  plugin: {
    partners: [
      { name: "Andri", initials: "A", percentage: 40 },
      { name: "Asrud", initials: "As", percentage: 40 },
      { name: "Modal & Dev", initials: "M", percentage: 20 },
    ],
  },
  jasa: {
    partners: [
      { name: "Andri", initials: "A", percentage: 40 },
      { name: "Asrud", initials: "As", percentage: 60 },
    ],
  },
};

const DEFAULT_MARKETPLACES = MARKETPLACES;

// Module-level cache — shared across all hook instances in the same session
let _settingsCache = null;
let _settingsPromise = null;

/** Invalidate settings cache (forces re-fetch on next hook mount) */
export function invalidateSettingsCache() {
  _settingsCache = null;
  _settingsPromise = null;
}

/** Fetch settings from Supabase (shared promise to avoid duplicate calls) */
function fetchSettings() {
  if (_settingsCache) return Promise.resolve(_settingsCache);
  if (_settingsPromise) return _settingsPromise;

  if (!supabase) {
    const defaults = { marketplaces: DEFAULT_MARKETPLACES, profitSharing: DEFAULT_PROFIT_SHARING };
    _settingsCache = defaults;
    return Promise.resolve(defaults);
  }

  _settingsPromise = supabase
    .from("settings")
    .select("key, value")
    .then(({ data, error }) => {
      if (error) throw error;

      const map = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });

      const mp = Array.isArray(map.marketplaces)
        ? map.marketplaces
        : DEFAULT_MARKETPLACES;
      const ps = map.profit_sharing || DEFAULT_PROFIT_SHARING;

      _settingsCache = { marketplaces: mp, profitSharing: ps };
      return _settingsCache;
    })
    .catch((err) => {
      console.warn("[Settings] Failed to load:", err.message);
      _settingsCache = { marketplaces: DEFAULT_MARKETPLACES, profitSharing: DEFAULT_PROFIT_SHARING };
      return _settingsCache;
    })
    .finally(() => {
      _settingsPromise = null;
    });

  return _settingsPromise;
}

/**
 * Hook to load and save app settings from Supabase settings table.
 * Falls back to defaults if Supabase is unavailable.
 */
export function useSettings() {
  const [marketplaces, setMarketplaces] = useState(
    () => _settingsCache?.marketplaces || DEFAULT_MARKETPLACES
  );
  const [profitSharing, setProfitSharing] = useState(
    () => _settingsCache?.profitSharing || DEFAULT_PROFIT_SHARING
  );
  const [loading, setLoading] = useState(!_settingsCache);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (_settingsCache) {
      setMarketplaces(_settingsCache.marketplaces);
      setProfitSharing(_settingsCache.profitSharing);
      setLoading(false);
      return;
    }

    fetchSettings().then((settings) => {
      setMarketplaces(settings.marketplaces);
      setProfitSharing(settings.profitSharing);
      setLoading(false);
    });
  }, []);

  // Save marketplaces
  const saveMarketplaces = useCallback(async (newList) => {
    setSaving(true);
    setMarketplaces(newList);

    if (supabase) {
      try {
        const { error } = await supabase
          .from("settings")
          .upsert({ id: "set-1", key: "marketplaces", value: newList, updated_at: new Date().toISOString() });
        if (error) throw error;
      } catch (err) {
        console.warn("[Settings] Failed to save marketplaces:", err.message);
      }
    }

    _settingsCache = { ...(_settingsCache || {}), marketplaces: newList };
    setSaving(false);
  }, []);

  // Save profit sharing
  const saveProfitSharing = useCallback(async (newConfig) => {
    setSaving(true);
    setProfitSharing(newConfig);

    if (supabase) {
      try {
        const { error } = await supabase
          .from("settings")
          .upsert({ id: "set-2", key: "profit_sharing", value: newConfig, updated_at: new Date().toISOString() });
        if (error) throw error;
      } catch (err) {
        console.warn("[Settings] Failed to save profit sharing:", err.message);
      }
    }

    _settingsCache = { ...(_settingsCache || {}), profitSharing: newConfig };
    setSaving(false);
  }, []);

  return {
    marketplaces,
    profitSharing,
    loading,
    saving,
    saveMarketplaces,
    saveProfitSharing,
  };
}

/**
 * Get profit sharing config synchronously (from cache or defaults).
 * Used by computeProfitSharing without requiring React context.
 */
export function getProfitSharingConfig() {
  return _settingsCache?.profitSharing || DEFAULT_PROFIT_SHARING;
}

/**
 * Get marketplaces list synchronously (from cache or defaults).
 */
export function getMarketplacesConfig() {
  return _settingsCache?.marketplaces || DEFAULT_MARKETPLACES;
}
