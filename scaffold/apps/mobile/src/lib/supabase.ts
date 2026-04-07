/**
 * Supabase client singleton for the mobile app.
 *
 * Uses expo-secure-store for session persistence and
 * Expo Constants for environment variable access.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { secureStoreAdapter } from "./secure-store";

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client configured for React Native.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const extra = Constants.expoConfig?.extra;
    const url = extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key =
      extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    _client = createClient(url, key, {
      auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // No URL session detection in React Native
      },
    });
  }

  return _client;
}

export { createClient };
export type { SupabaseClient };
