/**
 * @syndeocare/config — Validation Patterns
 *
 * Centralised regex patterns used across the platform
 * for form validation, input masking, and server-side checks.
 */

/** Yemeni phone: +967 followed by 9 digits */
export const PHONE_REGEX = /^\+967\d{9}$/;

/** Loose international phone */
export const PHONE_INTL_REGEX = /^\+\d{10,15}$/;

/** Standard email (RFC 5322 simplified) */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Yemeni Tax ID / Commercial Registration */
export const TAX_ID_REGEX = /^[A-Za-z0-9\-]{5,20}$/;

/** Strong password: ≥8 chars, 1 upper, 1 lower, 1 digit */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

/** UUID v4 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Slug: lowercase alphanumeric + hyphens */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** OTP code: exactly 6 digits */
export const OTP_REGEX = /^\d{6}$/;

/** Coordinate latitude: -90 to 90 */
export const LATITUDE_REGEX = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;

/** Coordinate longitude: -180 to 180 */
export const LONGITUDE_REGEX =
  /^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
