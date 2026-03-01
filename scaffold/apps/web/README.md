# @syndeocare/web

The main SyndeoCare web application — a healthcare staffing platform connecting medical professionals with clinics in Yemen.

## Overview

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Recommended subdomain**: `app.syndeocare.ai`

## Structure

```
web/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── app/                     # Route-level pages
│   │   ├── (public)/            # Public routes (home, about, auth)
│   │   ├── (dashboard)/         # Authenticated routes
│   │   └── (onboarding)/        # Onboarding flows
│   ├── components/              # Feature components
│   │   ├── booking/
│   │   ├── chat/
│   │   ├── clinic/
│   │   ├── dashboard/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   └── shifts/
│   ├── hooks/                   # Custom React hooks
│   ├── contexts/                # React contexts (Auth, Theme, Language)
│   ├── lib/                     # Utility functions
│   ├── config/                  # App configuration
│   └── assets/                  # Images, fonts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── capacitor.config.ts          # Mobile (iOS/Android)
└── env.ts                       # Environment validation
```

## Environment Variables

```bash
VITE_SUPABASE_URL=               # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY=   # Supabase anon key
VITE_SUPABASE_PROJECT_ID=        # Supabase project ID
VITE_APP_URL=                    # https://app.syndeocare.ai
VITE_SENTRY_DSN=                 # Error tracking
VITE_POSTHOG_KEY=                # Analytics
```

## Scripts

```bash
pnpm dev          # Start dev server on :8080
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm test         # Run Vitest
pnpm test:e2e     # Run Playwright E2E tests
```
