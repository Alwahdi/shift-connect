/**
 * @syndeocare/config — Environment Variable Validation
 *
 * Validates ALL environment variables at app startup using Zod.
 * Fail-fast: if any required variable is missing or malformed,
 * the app throws before rendering.
 */
import { z } from "zod";

// ── Schema ──────────────────────────────────────────────────────────────────
const envSchema = z.object({
  // Required — Supabase
  VITE_SUPABASE_URL: z
    .string({ required_error: "VITE_SUPABASE_URL is required" })
    .url("VITE_SUPABASE_URL must be a valid URL"),

  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string({ required_error: "VITE_SUPABASE_PUBLISHABLE_KEY is required" })
    .min(1, "VITE_SUPABASE_PUBLISHABLE_KEY cannot be empty"),

  VITE_SUPABASE_PROJECT_ID: z
    .string({ required_error: "VITE_SUPABASE_PROJECT_ID is required" })
    .min(1, "VITE_SUPABASE_PROJECT_ID cannot be empty"),

  // Optional — App
  VITE_APP_URL: z.string().url().optional(),
  VITE_APP_NAME: z.string().optional().default("SyndeoCare"),

  // Optional — Monitoring
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
});

// ── Type Export ─────────────────────────────────────────────────────────────
export type Env = z.infer<typeof envSchema>;

// ── Validated Instance ──────────────────────────────────────────────────────
let _env: Env | null = null;

/**
 * Returns validated environment variables.
 * Lazily parsed on first call so tests can mock `import.meta.env` before invoking.
 */
export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(
      typeof import.meta !== "undefined" ? import.meta.env : process.env
    );

    if (!result.success) {
      const formatted = result.error.issues
        .map((i) => `  ✗ ${i.path.join(".")}: ${i.message}`)
        .join("\n");

      throw new Error(
        `\n╔══════════════════════════════════════════════╗\n` +
          `║  ❌  Environment validation failed            ║\n` +
          `╚══════════════════════════════════════════════╝\n\n` +
          `${formatted}\n\n` +
          `Copy .env.example to .env.local and fill in the values.\n`
      );
    }

    _env = result.data;
  }

  return _env;
}

/** Convenience — direct import for components that just need values. */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
