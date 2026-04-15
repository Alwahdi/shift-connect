// SyndeoCare Mobile Theme - Brand Colors: Green (#7CB53D) and Teal (#3BC4C3)
export const colors = {
  primary: "#7CB53D",
  primaryDark: "#629130",
  primaryLight: "#92CB55",
  primaryBg: "#F3F9EC",
  teal: "#3BC4C3",
  tealDark: "#2F9D9C",
  tealLight: "#55E0DD",
  tealBg: "#ECFCFC",
  sky: "#199FF0",
  success: "#26B45F",
  successBg: "#ECFDF5",
  warning: "#FFA500",
  warningBg: "#FFFBEB",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  white: "#FFFFFF",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F3F4F6",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  text: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",
  dark: {
    background: "#0F1419",
    surface: "#1A1F2E",
    surfaceSecondary: "#242937",
    border: "#2D3348",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",
  },
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, "2xl": 32, "3xl": 40, "4xl": 48,
} as const;

export const borderRadius = {
  xs: 4, sm: 6, md: 8, DEFAULT: 10, lg: 12, xl: 16, "2xl": 20, full: 9999,
} as const;

export const typography = {
  sizes: { xs: 11, sm: 13, base: 15, md: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 28, "4xl": 32 },
  weights: { normal: "400" as const, medium: "500" as const, semibold: "600" as const, bold: "700" as const },
} as const;

export const shadows = {
  sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
} as const;

export const TOUCH_TARGET = 44;
