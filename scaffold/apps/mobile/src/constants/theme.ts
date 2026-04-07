/**
 * Design tokens adapted for React Native.
 *
 * Provides platform-appropriate values derived from
 * @syndeocare/design-tokens for use with StyleSheet and components.
 */

export const colors = {
  primary: "#663C6D",
  primaryForeground: "#FFFFFF",
  accent: "#56849A",
  accentForeground: "#FFFFFF",
  success: "#2D9A6E",
  successForeground: "#FFFFFF",
  warning: "#F59E0B",
  warningForeground: "#FFFFFF",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",

  // Light theme
  light: {
    background: "#F8FAFC",
    foreground: "#2D1F33",
    card: "#FFFFFF",
    cardForeground: "#2D1F33",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#663C6D",
  },

  // Dark theme
  dark: {
    background: "#1A0F1E",
    foreground: "#F8FAFC",
    card: "#2D1F33",
    cardForeground: "#F8FAFC",
    muted: "#2D1F33",
    mutedForeground: "#94A3B8",
    border: "#334155",
    input: "#334155",
    ring: "#663C6D",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    sans: "Cairo",
    mono: "JetBrains Mono",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  elegant: {
    shadowColor: "#663C6D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

/** Minimum touch target size per Apple/Material Design guidelines */
export const TOUCH_TARGET_SIZE = 44;
