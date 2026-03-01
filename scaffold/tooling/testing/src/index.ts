/**
 * @syndeocare/testing — Shared Test Utilities
 *
 * Common test helpers, mocks, and factories
 * used across all packages and apps.
 */
import React from "react";

// ── Mock Factories ──────────────────────────────────────────────────────────

export function createMockUser(overrides = {}) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockProfile(overrides = {}) {
  return {
    id: "test-profile-id",
    user_id: "test-user-id",
    full_name: "Dr. Test User",
    email: "test@example.com",
    phone: "+967771234567",
    specialties: ["General Medicine"],
    qualifications: ["MBBS"],
    hourly_rate: 5000,
    verification_status: "verified" as const,
    onboarding_completed: true,
    is_available: true,
    rating_avg: 4.5,
    rating_count: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockClinic(overrides = {}) {
  return {
    id: "test-clinic-id",
    user_id: "test-clinic-user-id",
    name: "Al-Thawra Hospital",
    email: "info@thawra.ye",
    phone: "+967771234568",
    address: "Sanaa, Yemen",
    verification_status: "verified" as const,
    onboarding_completed: true,
    rating_avg: 4.8,
    rating_count: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockShift(overrides = {}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    id: "test-shift-id",
    clinic_id: "test-clinic-id",
    title: "Morning Shift - General Physician",
    role_required: "Physician",
    shift_date: tomorrow.toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "16:00",
    hourly_rate: 5000,
    is_urgent: false,
    is_filled: false,
    max_applicants: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── Supabase Mock ───────────────────────────────────────────────────────────

export function createMockSupabase() {
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    lt: () => mockQuery,
    gte: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    in: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    range: () => mockQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: Function) => resolve({ data: [], error: null }),
  };

  return {
    from: () => mockQuery,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: {}, error: null }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: {}, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/file.png" } }),
        remove: () => Promise.resolve({ data: {}, error: null }),
      }),
    },
    functions: {
      invoke: () => Promise.resolve({ data: {}, error: null }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
  };
}

// ── Test IDs ────────────────────────────────────────────────────────────────

/**
 * Generate deterministic test IDs for stable snapshots.
 */
export function testId(prefix: string, index = 0): string {
  return `${prefix}-${String(index).padStart(4, "0")}`;
}
