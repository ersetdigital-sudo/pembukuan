/**
 * Supabase Data API — thin wrappers with mock-data fallback.
 * Every fetch falls back to getMockData() if Supabase is offline,
 * unconfigured, or the table is empty (e.g. before seeding).
 */
import { supabase } from "./client";
import { getMockData } from "@/lib/data/mock";

/** Fetch a single table; fallback to mock on failure. */
export async function fetchTable(table) {
  if (!supabase) return getMockData()[table];
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`[Supabase] fetch ${table} error:`, error.message);
    return getMockData()[table];
  }
  return data || [];
}

/** Wrap a Supabase call with a timeout so the UI never hangs forever. */
async function withTimeout(promise, ms = 15000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Request timed out, coba lagi")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** Insert a row and return the inserted record. */
export async function insertRow(table, row) {
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  try {
    const { data, error } = await withTimeout(
      supabase.from(table).insert(row).select().single()
    );
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Update a row by id. */
export async function updateRow(table, id, row) {
  if (!supabase) return { data: null, error: new Error("Supabase not configured") };
  try {
    const { data, error } = await withTimeout(
      supabase.from(table).update(row).eq("id", id).select().single()
    );
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Delete a row by id. */
export async function deleteRow(table, id) {
  if (!supabase) return { error: new Error("Supabase not configured") };
  try {
    const { error } = await withTimeout(
      supabase.from(table).delete().eq("id", id)
    );
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/** Fetch all tables the app needs. */
export async function fetchAllData() {
  const [stocks, sales, expenses, incomes, purchases, iklans] = await Promise.all([
    fetchTable("stocks"),
    fetchTable("sales"),
    fetchTable("expenses"),
    fetchTable("incomes"),
    fetchTable("purchases"),
    fetchTable("iklans"),
  ]);
  return { stocks, sales, expenses, incomes, purchases, iklans };
}
