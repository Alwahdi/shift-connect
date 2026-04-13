# SyndeoCare — Deployment Guide

## Web Deployment

The web app is automatically deployed via Lovable. Published URL: `https://syndeocareapp.lovable.app`

To deploy to a custom domain:
1. Go to Project → Settings → Domains
2. Add your custom domain (e.g., `app.syndeocare.ai`)
3. Configure DNS records as instructed

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

Edge function secrets (configured in backend):
| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Resend email service API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (auto-configured) |
