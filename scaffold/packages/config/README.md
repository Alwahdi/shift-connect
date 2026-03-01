# @syndeocare/config

Shared configuration, constants, and environment validation for SyndeoCare.

## Structure

```
config/
├── src/
│   ├── env.ts                   # Environment variable validation (Zod)
│   ├── constants.ts             # App-wide constants
│   ├── patterns.ts              # Regex patterns (email, phone, etc.)
│   └── backend.ts               # Backend configuration
└── package.json
```

## Environment Validation

```typescript
// env.ts — validates all env vars at startup
import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
  VITE_APP_URL: z.string().url().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
```

## Constants

```typescript
export const APP_CONFIG = {
  name: "SyndeoCare",
  tagline: "Healthcare Staffing Platform",
  country: "Yemen",
  currency: { code: "YER", symbol: "ر.ي" },
  phone: { prefix: "+967", format: "+967 XXX XXX XXX" },
  languages: ["en", "ar"] as const,
  defaultLanguage: "en",
  rtlLanguages: ["ar"],
  pagination: { defaultPageSize: 20, maxPageSize: 100 },
  uploads: { maxFileSizeMB: 10, allowedTypes: ["image/*", "application/pdf"] },
  shifts: { maxApplicants: 50, cancellationWindowHours: 24 },
  otp: { expiryMinutes: 10, maxAttempts: 3 },
};
```
