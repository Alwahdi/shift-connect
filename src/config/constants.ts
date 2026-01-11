// =====================================================
// CENTRALIZED CONFIGURATION - All app constants in one place
// Change values here to update across the entire application
// =====================================================

/**
 * Site configuration - Brand and general settings
 */
export const SITE_CONFIG = {
  name: "SyndeoCare",
  tagline: "Healthcare Staffing, Simplified",
  description: "Connect healthcare professionals with facilities seamlessly",
  url: "https://syndeocare.vercel.app",
  supportEmail: "support@syndeocare.ai",
  supportPhone: "+966-55-000-0000",
  location: "Riyadh, Saudi Arabia",
} as const;

/**
 * Platform statistics - Update these as your platform grows
 * These are displayed on the homepage and about page
 */
export const PLATFORM_STATS = {
  professionals: {
    value: "100+",
    labelKey: "stats.professionals",
  },
  facilities: {
    value: "25+",
    labelKey: "stats.facilities",
  },
  completedShifts: {
    value: "500+",
    labelKey: "stats.completedShifts",
  },
  averageRating: {
    value: "4.8",
    labelKey: "stats.avgRating",
  },
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  // Production redirect URL for OAuth
  redirectUrl: "https://syndeocare.vercel.app/auth/callback",
  // Site URL for Supabase auth
  siteUrl: "https://syndeocare.vercel.app",
  // Minimum password length
  minPasswordLength: 6,
} as const;

/**
 * UI Configuration - Design system constants
 */
export const UI_CONFIG = {
  // Animation durations (seconds)
  animationDuration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  // Border radius values
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
  },
  // Container max widths
  containerMaxWidth: "1400px",
  // Minimum touch target size for mobile (in pixels)
  minTouchTarget: 44,
} as const;

/**
 * Navigation links - Centralized nav configuration
 */
export const NAV_LINKS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/shifts", labelKey: "nav.findShifts" },
  { href: "/for-professionals", labelKey: "nav.forProfessionals" },
  { href: "/for-clinics", labelKey: "nav.forClinics" },
  { href: "/about", labelKey: "nav.about" },
] as const;

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/syndeocare",
  linkedin: "https://linkedin.com/company/syndeocare",
  instagram: "https://instagram.com/syndeocare",
} as const;

/**
 * Feature flags - Enable/disable features
 */
export const FEATURES = {
  darkMode: true,
  googleAuth: true,
  emailVerification: true,
  realTimeUpdates: true,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Default pagination limit
  defaultPageSize: 20,
  // Maximum file upload size (in bytes) - 10MB
  maxFileSize: 10 * 1024 * 1024,
  // Allowed file types for documents
  allowedDocumentTypes: ["pdf", "jpg", "jpeg", "png"],
  // Allowed file types for avatars
  allowedAvatarTypes: ["jpg", "jpeg", "png", "webp"],
} as const;
