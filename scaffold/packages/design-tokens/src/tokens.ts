/**
 * @syndeocare/design-tokens — DTCG Standard Tokens
 *
 * Design Token Community Group (DTCG) format for
 * cross-platform token generation.
 *
 * Can be consumed by Style Dictionary, Figma Tokens, etc.
 */
export const tokens = {
  $type: "designTokens",
  $description: "SyndeoCare Design Tokens — DTCG Format",

  color: {
    primary: {
      $type: "color",
      $value: "#663C6D",
      $description: "Deep Purple — brand primary",
    },
    primaryForeground: {
      $type: "color",
      $value: "#FFFFFF",
    },
    accent: {
      $type: "color",
      $value: "#56849A",
      $description: "Teal Blue — secondary accent",
    },
    accentForeground: {
      $type: "color",
      $value: "#FFFFFF",
    },
    success: {
      $type: "color",
      $value: "#2D9A6E",
      $description: "Verified / success states",
    },
    destructive: {
      $type: "color",
      $value: "#DC2626",
    },
    background: {
      $type: "color",
      $value: "#F8FAFC",
      $description: "Cool white background",
    },
    foreground: {
      $type: "color",
      $value: "#2D1F33",
      $description: "Dark purple text",
    },
    muted: {
      $type: "color",
      $value: "#F1F5F9",
    },
    mutedForeground: {
      $type: "color",
      $value: "#64748B",
    },
    border: {
      $type: "color",
      $value: "#E2E8F0",
    },
    sidebar: {
      $type: "color",
      $value: "#1A0F1E",
      $description: "Dark sidebar background",
    },
  },

  typography: {
    fontFamily: {
      sans: {
        $type: "fontFamily",
        $value: ["Cairo", "system-ui", "sans-serif"],
        $description: "Primary font — supports Arabic",
      },
      mono: {
        $type: "fontFamily",
        $value: ["JetBrains Mono", "monospace"],
      },
    },
    fontSize: {
      xs: { $type: "dimension", $value: "0.75rem" },
      sm: { $type: "dimension", $value: "0.875rem" },
      base: { $type: "dimension", $value: "1rem" },
      lg: { $type: "dimension", $value: "1.125rem" },
      xl: { $type: "dimension", $value: "1.25rem" },
      "2xl": { $type: "dimension", $value: "1.5rem" },
      "3xl": { $type: "dimension", $value: "1.875rem" },
      "4xl": { $type: "dimension", $value: "2.25rem" },
    },
  },

  spacing: {
    xs: { $type: "dimension", $value: "0.25rem" },
    sm: { $type: "dimension", $value: "0.5rem" },
    md: { $type: "dimension", $value: "1rem" },
    lg: { $type: "dimension", $value: "1.5rem" },
    xl: { $type: "dimension", $value: "2rem" },
    "2xl": { $type: "dimension", $value: "3rem" },
  },

  borderRadius: {
    sm: { $type: "dimension", $value: "0.375rem" },
    md: { $type: "dimension", $value: "0.75rem" },
    lg: { $type: "dimension", $value: "1rem" },
    full: { $type: "dimension", $value: "9999px" },
  },

  shadow: {
    sm: {
      $type: "shadow",
      $value: "0 1px 2px 0 rgba(0,0,0,0.05)",
    },
    md: {
      $type: "shadow",
      $value: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    },
    lg: {
      $type: "shadow",
      $value: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    },
    elegant: {
      $type: "shadow",
      $value: "0 10px 30px -10px rgba(102,60,109,0.3)",
      $description: "Brand-tinted elevation shadow",
    },
  },
} as const;

export default tokens;
