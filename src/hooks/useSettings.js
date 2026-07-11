"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { MARKETPLACES } from "@/lib/constants";

// Default profit sharing config
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

// Global state — shared across all components
let _settings = {
  marketplaces: DEFAULT_MARKETPLACES,
  profitSharing: DEFAULT_PROFIT_SHARING,
  loaded: false,
};
let _fetchPromise = null;
let _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn({ ..._settings }));
}

/** Fetch settings from Supabase once */
function ensureLoaded() {
  if (_settings.loaded) return Promise.resolve(_settings);
  if (_fetchPromise) return _fetchPromise;

  if (!supabase) {
    _settings.loaded = true;
    return Promise.resolve(_settings);
  }

  _fetchPromise = supabase
    .from("settings")
    .select("key, value")
    .then(({ data, error }) => {
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => { map[row.key] = row.value; });

      if (Array.isArray(map.marketplaces)) {
        _settings.marketplaces = map.marketplaces;
      }
      if (map.profit_sharing && map.profit_sharing.plugin) {
        _settings.profitSharing = map.profit_sharing;
      }
      _settings.loaded = true;
      notify();
      return _settings;
    })
    .catch((err) => {
      console.warn("[Settings] load error:", err.message);
      _settings.loaded = true;
      return _settings;
    })
    .finally(() => { _fetchPromise = null; });

  return _fetchPromise;
}

/**
 * Hook to use app settings. Always returns latest from global state.
 */
export function useSettings() {
  const [state, setState] = useState(() => ({ ..._settings }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Subscribe to changes
    const listener = (s) => setState(s);
    _listeners.add(listener);

    // Trigger load if not loaded yet
    if (!_settings.loaded) {
      ensureLoaded().then((s) => setState({ ...s }));
    } else {
      // Sync in case another component updated
      setState({ ..._settings });
    }

    return () => { _listeners.delete(listener); };
  }, []);

  // Save marketplaces
  const saveMarketplaces = useCallback(async (newList) => {
    setSaving(true);
    _settings.marketplaces = newList;
    notify();

    if (supabase) {
      try {
        await supabase
          .from("settings")
          .upsert({ id: "set-1", key: "marketplaces", value: newList, updated_at: new Date().toISOString() });
      } catch (err) {
        console.warn("[Settings] save marketplaces error:", err.message);
      }
    }
    setSaving(false);
  }, []);

  // Save profit sharing
  const saveProfitSharing = useCallback(async (newConfig) => {
    setSaving(true);
    _settings.profitSharing = newConfig;
    notify();

    if (supabase) {
      try {
        await supabase
          .from("settings")
          .upsert({ id: "set-2", key: "profit_sharing", value: newConfig, updated_at: new Date().toISOString() });
      } catch (err) {
        console.warn("[Settings] save profit_sharing error:", err.message);
      }
    }
    setSaving(false);
  }, []);

  return {
    marketplaces: state.marketplaces,
    profitSharing: state.profitSharing,
    loading: !state.loaded,
    saving,
    saveMarketplaces,
    saveProfitSharing,
  };
}

/** Sync getter for non-React code */
export function getProfitSharingConfig() {
  return _settings.profitSharing;
}

export function getMarketplacesConfig() {
  return _settings.marketplaces;
}
