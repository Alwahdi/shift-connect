// =====================================================
// BACKEND CONFIGURATION
// =====================================================
// This file centralizes all backend connection settings.
//
// The platform uses a self-hosted NestJS microservices stack (services/*)
// exposed via an nginx API gateway.
//
// Set VITE_API_URL to the base URL of the API gateway, e.g.:
//   Development : http://localhost:8080
//   Production  : https://api.syndeocare.ai
//
// Legacy Supabase integration (apps/web/src/integrations/supabase/)
// is still used for certain UI-layer features during the migration period.
// New features should call the API gateway directly using `API_BASE_URL`.
// =====================================================

export const BACKEND_CONFIG = {
  /** Base URL of the NestJS API gateway. Override via VITE_API_URL env var. */
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',

  // ── Legacy Supabase connection (kept for backwards-compat during migration) ──
  /** Supabase project URL. Override via VITE_SUPABASE_URL env var. */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,

  /** Supabase anon/public key. Override via VITE_SUPABASE_PUBLISHABLE_KEY env var. */
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
} as const;

/** Convenience alias for the API gateway base URL. */
export const API_BASE_URL = BACKEND_CONFIG.apiUrl;
