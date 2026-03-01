# SyndeoCare — Environment Variables

## Required Variables

### Client-Side (VITE_ prefix)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | ✅ | Supabase project identifier |

### Server-Side (Edge Functions)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Auto-provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Auto-provided by Supabase |
| `RESEND_API_KEY` | ⚠️ | Required for email sending |

### Optional (Monitoring & Analytics)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SENTRY_DSN` | ❌ | Sentry error tracking DSN |
| `VITE_POSTHOG_KEY` | ❌ | PostHog analytics key |
| `VITE_APP_URL` | ❌ | Production app URL |

## Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

## .env.example

```bash
# ============================================================================
# SyndeoCare Environment Variables
# ============================================================================

# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=your-project-id

# App URLs (Optional)
VITE_APP_URL=https://app.syndeocare.ai

# Monitoring (Optional)
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
```

## Security Notes

- **NEVER** commit `.env.local` or `.env` files
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use GitHub Secrets for CI/CD variables
- Rotate keys periodically
