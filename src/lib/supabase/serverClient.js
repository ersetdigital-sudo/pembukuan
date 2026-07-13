/**
 * Server-side Supabase client — for use inside API routes only.
 * Separate from the browser singleton in `client.js` so server code
 * never accidentally depends on browser-only behavior (persistSession, etc).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getServerSupabase() {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
