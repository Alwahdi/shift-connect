/**
 * @syndeocare/database — Client Factory
 *
 * Creates typed Supabase clients for use across packages.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Note: In production, import the auto-generated types:
// import type { Database } from "./types";

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client.
 * Uses VITE_ prefixed env vars (client-safe).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY"
      );
    }

    _client = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return _client;
}

export { createClient };
