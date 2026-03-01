/**
 * @syndeocare/config — Application Constants
 *
 * Single source of truth for magic numbers, limits, and
 * platform configuration. Import from here — never hardcode.
 */

export const APP_CONFIG = {
  name: "SyndeoCare",
  tagline: "Healthcare Staffing Platform",
  country: "Yemen",
  currency: { code: "YER", symbol: "ر.ي", locale: "ar-YE" },
  phone: { prefix: "+967", format: "+967 XXX XXX XXX", digits: 9 },
  languages: ["en", "ar"] as const,
  defaultLanguage: "en" as const,
  rtlLanguages: ["ar"] as const,
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  cursorBased: false, // switch to true when scaling past 100k rows
} as const;

export const UPLOADS = {
  maxFileSizeMB: 10,
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedDocTypes: ["application/pdf"],
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  avatarMaxSizeMB: 5,
} as const;

export const SHIFTS = {
  maxApplicants: 50,
  cancellationWindowHours: 24,
  defaultRadiusKm: 50,
  maxRadiusKm: 200,
} as const;

export const OTP = {
  length: 6,
  expiryMinutes: 15,
  maxAttempts: 3,
  cooldownSeconds: 60,
} as const;

export const AUTH = {
  sessionRefreshMarginSeconds: 60,
  passwordMinLength: 8,
  passwordMaxLength: 72, // bcrypt limit
} as const;

export const REALTIME = {
  heartbeatIntervalMs: 30_000,
  reconnectDelayMs: 1_000,
  maxReconnectAttempts: 10,
} as const;

export const QUERY = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  retryCount: 1,
  retryDelay: 1_000,
} as const;

export const ROLES = {
  professional: "professional",
  clinic: "clinic",
  admin: "admin",
  superAdmin: "super_admin",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
