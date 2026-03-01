# SyndeoCare Production Scaffold

> A production-grade monorepo template for SyndeoCare — inspired by [next-forge](https://next-forge.com) philosophy, adapted for React + Vite + Supabase.

## Philosophy

| Principle | Description |
|-----------|-------------|
| **Fast** | Fast to build, deploy, validate ideas, iterate and scale. |
| **Cheap** | Free to start. Scales with usage. No recurring costs upfront. |
| **Opinionated** | Tooling designed to work together. Reduces friction. |
| **Modern** | Latest stable versions. No legacy patterns. |
| **Scalable** | From prototype to millions of users. |
| **Secure** | RLS by default. Auth-first. Zero-trust architecture. |

## Structure

```
scaffold/
├── README.md                    # This file
├── apps/
│   ├── web/                     # Main SyndeoCare web app (React + Vite)
│   ├── admin/                   # Admin dashboard (standalone)
│   ├── docs/                    # Documentation site
│   └── api/                     # Edge functions / API layer
├── packages/
│   ├── ui/                      # Shared UI component library
│   ├── database/                # Database schema, migrations, types
│   ├── auth/                    # Authentication utilities
│   ├── config/                  # Shared configuration & env validation
│   ├── i18n/                    # Internationalization (en/ar)
│   ├── analytics/               # Analytics & tracking
│   ├── email/                   # Email templates & sending
│   ├── storage/                 # File storage utilities
│   └── design-tokens/           # Design system tokens (DTCG)
├── tooling/
│   ├── eslint/                  # Shared ESLint config
│   ├── typescript/              # Shared TypeScript config
│   ├── tailwind/                # Shared Tailwind config
│   └── testing/                 # Shared test utilities
├── infrastructure/
│   ├── docker/                  # Docker configs
│   ├── ci-cd/                   # GitHub Actions workflows
│   ├── monitoring/              # Health checks & alerting
│   └── scripts/                 # Build, deploy, seed scripts
└── docs/
    ├── ARCHITECTURE.md          # System architecture
    ├── DEPLOYMENT.md            # Deployment guide
    ├── SECURITY.md              # Security best practices
    ├── CONTRIBUTING.md          # Contribution guidelines
    ├── API-REFERENCE.md         # API documentation
    ├── DATABASE.md              # Database schema docs
    ├── ENVIRONMENT.md           # Environment variables
    └── RUNBOOK.md               # Operations runbook
```

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> syndeocare
cd syndeocare

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development
pnpm dev

# 5. Run all apps
pnpm dev --filter=web
pnpm dev --filter=admin
pnpm dev --filter=docs
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + Vite 5 | UI rendering & bundling |
| **Styling** | Tailwind CSS 3 + shadcn/ui | Design system |
| **State** | TanStack Query + Zustand | Server & client state |
| **Auth** | Supabase Auth | Authentication & authorization |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Storage** | Supabase Storage | File uploads |
| **Realtime** | Supabase Realtime | Live updates |
| **i18n** | i18next | English & Arabic |
| **Mobile** | Capacitor | iOS & Android |
| **Edge** | Supabase Edge Functions (Deno) | Serverless API |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Monitoring** | Sentry + PostHog | Error tracking & analytics |
| **Email** | Resend | Transactional emails |

## License

Private — SyndeoCare © 2024-2026
