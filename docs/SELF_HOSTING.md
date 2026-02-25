# SyndeoCare — Self-Hosted Backend Migration Guide

## Overview

SyndeoCare uses Supabase as its backend. Migrating to a self-hosted Supabase instance requires:

1. Setting up a Supabase instance
2. Running database migrations
3. Deploying edge functions
4. Updating environment variables

**No frontend code changes are required.**

## Step 1: Set Up Supabase

### Option A: Supabase Cloud (Managed)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

### Option B: Self-Hosted Supabase (Docker)

```bash
# Clone the Supabase Docker setup
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy and configure environment
cp .env.example .env
# Edit .env with your secrets (JWT secret, DB password, etc.)

# Start all services
docker compose up -d
```

Your Supabase instance will be available at `http://localhost:8000`.

## Step 2: Run Database Migrations

All migrations are in `supabase/migrations/`. Apply them in order:

```bash
# Option 1: Using Supabase CLI
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Option 2: Manual SQL execution
# Connect to your PostgreSQL instance and run each migration file
psql -h YOUR_DB_HOST -U postgres -d postgres -f supabase/migrations/XXXXXX_migration.sql
```

### Required Extensions

The app uses PostGIS for geolocation features. Ensure it's enabled:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Step 3: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy send-email-notification
supabase functions deploy send-otp-email
supabase functions deploy verify-otp
supabase functions deploy delete-account
```

### Configure Edge Function Secrets

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set APP_URL=https://your-domain.com
```

## Step 4: Update Environment Variables

Create or update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_ref
```

## Step 5: Configure Authentication

In your Supabase dashboard (or `config.toml` for self-hosted):

1. **Email Auth**: Enable email sign-up with OTP verification
2. **Google OAuth** (optional): Add Google client ID and secret
3. **Redirect URLs**: Add your domain to the allowed redirect URLs list
4. **Email Templates**: Configure or customize auth email templates

## Step 6: Configure Storage

Create the required storage buckets:

```sql
-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Documents bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Chat media bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-media', 'chat-media', false);
```

Apply the corresponding RLS policies from your migrations.

## Step 7: Verify

1. Run the app: `npm run dev`
2. Test sign-up and login
3. Test profile creation and onboarding
4. Test shift creation and booking
5. Test real-time messaging
6. Test document uploads

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth not working | Check redirect URLs in Supabase Auth settings |
| RLS errors | Ensure all migrations ran including policy creation |
| PostGIS errors | Enable the PostGIS extension on your database |
| Edge function 500s | Check secrets are set: `supabase secrets list` |
| Email not sending | Verify RESEND_API_KEY is set and valid |

## Architecture Reference

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system architecture diagram and database schema documentation.
