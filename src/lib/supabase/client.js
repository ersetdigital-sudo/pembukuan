/**
 * Supabase Browser Client — safe singleton with env-guard.
 * If env vars are missing (e.g. Vercel not configured yet),
 * supabase will be null and every helper falls back to mock data.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key, {
  auth: { persistSession: false }, // app-level auth not used yet
}) : null;

/** True when the Supabase client is actually connected. */
export const isSupabaseReady = () => supabase != null;
