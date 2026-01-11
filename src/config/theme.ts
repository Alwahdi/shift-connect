// =====================================================
// THEME CONFIGURATION - Centralized color palette
// Based on: Deep Navy, Coral Pink, Light Sky Blue
// =====================================================

/**
 * Color palette in HSL format
 * All colors are defined here and used in index.css
 */
export const THEME_COLORS = {
  light: {
    // Primary: Deep Navy Blue
    primary: { h: 227, s: 55, l: 28 },
    primaryForeground: { h: 0, s: 0, l: 100 },

    // Secondary: Very Light Blue
    secondary: { h: 220, s: 30, l: 96 },
    secondaryForeground: { h: 227, s: 55, l: 28 },

    // Accent: Coral Pink
    accent: { h: 345, s: 85, l: 62 },
    accentForeground: { h: 0, s: 0, l: 100 },

    // Sky Blue
    sky: { h: 199, s: 89, l: 48 },
    skyForeground: { h: 0, s: 0, l: 100 },

    // Success: Bright Teal
    success: { h: 160, s: 84, l: 39 },
    successForeground: { h: 0, s: 0, l: 100 },

    // Warning: Warm Orange
    warning: { h: 38, s: 92, l: 50 },
    warningForeground: { h: 0, s: 0, l: 100 },

    // Destructive: Red
    destructive: { h: 0, s: 84, l: 60 },
    destructiveForeground: { h: 0, s: 0, l: 100 },

    // Background & Foreground
    background: { h: 0, s: 0, l: 100 },
    foreground: { h: 227, s: 45, l: 18 },

    // Card
    card: { h: 0, s: 0, l: 100 },
    cardForeground: { h: 227, s: 45, l: 18 },

    // Muted
    muted: { h: 220, s: 14, l: 96 },
    mutedForeground: { h: 220, s: 15, l: 42 },

    // Border & Input
    border: { h: 220, s: 15, l: 90 },
    input: { h: 220, s: 15, l: 90 },
    ring: { h: 227, s: 55, l: 28 },
  },
  dark: {
    // Primary: Lighter Navy for dark mode
    primary: { h: 217, s: 75, l: 60 },
    primaryForeground: { h: 0, s: 0, l: 100 },

    // Secondary: Dark Blue
    secondary: { h: 224, s: 30, l: 18 },
    secondaryForeground: { h: 199, s: 89, l: 70 },

    // Accent: Coral Pink (slightly adjusted)
    accent: { h: 345, s: 85, l: 60 },
    accentForeground: { h: 0, s: 0, l: 100 },

    // Sky Blue (brighter for dark mode)
    sky: { h: 199, s: 89, l: 55 },
    skyForeground: { h: 0, s: 0, l: 100 },

    // Success
    success: { h: 160, s: 75, l: 45 },
    successForeground: { h: 224, s: 40, l: 8 },

    // Warning
    warning: { h: 38, s: 85, l: 55 },
    warningForeground: { h: 224, s: 40, l: 8 },

    // Destructive
    destructive: { h: 0, s: 72, l: 55 },
    destructiveForeground: { h: 0, s: 0, l: 100 },

    // Background & Foreground
    background: { h: 224, s: 40, l: 8 },
    foreground: { h: 210, s: 40, l: 98 },

    // Card
    card: { h: 224, s: 35, l: 11 },
    cardForeground: { h: 210, s: 40, l: 98 },

    // Muted
    muted: { h: 224, s: 25, l: 16 },
    mutedForeground: { h: 220, s: 18, l: 68 },

    // Border & Input
    border: { h: 224, s: 25, l: 18 },
    input: { h: 224, s: 25, l: 18 },
    ring: { h: 217, s: 75, l: 60 },
  },
} as const;

/**
 * Gradient definitions
 */
export const GRADIENTS = {
  primary: "linear-gradient(135deg, hsl(227, 55%, 28%) 0%, hsl(245, 50%, 35%) 100%)",
  accent: "linear-gradient(135deg, hsl(345, 85%, 62%) 0%, hsl(340, 80%, 55%) 100%)",
  hero: "linear-gradient(155deg, hsl(227, 55%, 22%) 0%, hsl(245, 48%, 30%) 50%, hsl(260, 45%, 35%) 100%)",
  sky: "linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(185, 85%, 45%) 100%)",
} as const;

/**
 * Shadow definitions
 */
export const SHADOWS = {
  sm: "0 1px 2px 0 hsl(227 45% 18% / 0.05)",
  md: "0 4px 6px -1px hsl(227 45% 18% / 0.08), 0 2px 4px -2px hsl(227 45% 18% / 0.05)",
  lg: "0 10px 15px -3px hsl(227 45% 18% / 0.1), 0 4px 6px -4px hsl(227 45% 18% / 0.05)",
  xl: "0 20px 25px -5px hsl(227 45% 18% / 0.12), 0 8px 10px -6px hsl(227 45% 18% / 0.06)",
  card: "0 1px 3px hsl(227 45% 18% / 0.06), 0 1px 2px -1px hsl(227 45% 18% / 0.06)",
} as const;

/**
 * Theme type
 */
export type Theme = "light" | "dark" | "system";

/**
 * Get system theme preference
 */
export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
