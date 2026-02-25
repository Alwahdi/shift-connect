// =====================================================
// BACKEND CONFIGURATION
// =====================================================
// This file centralizes all backend connection settings.
//
// SELF-HOSTED MIGRATION:
// To switch from Lovable Cloud to your own Supabase instance:
// 1. Set up your own Supabase project
// 2. Run all migrations from supabase/migrations/
// 3. Deploy edge functions: supabase functions deploy
// 4. Update the environment variables below to point to your instance:
//    - VITE_SUPABASE_URL → Your Supabase project URL
//    - VITE_SUPABASE_PUBLISHABLE_KEY → Your Supabase anon/public key
//
// No code changes are needed — only environment variables.
// =====================================================

export const BACKEND_CONFIG = {
  /** Supabase project URL. Override via VITE_SUPABASE_URL env var. */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,

  /** Supabase anon/public key. Override via VITE_SUPABASE_PUBLISHABLE_KEY env var. */
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,

  /** Supabase project ID (used for constructing edge function URLs). */
  supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID as string,
} as const;
