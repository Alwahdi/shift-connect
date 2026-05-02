# SyndeoCare – Self-Hosting Guide

Deploy the full SyndeoCare stack on any machine that has Docker installed — no external cloud services required except **Resend** for transactional emails.

---

## What's included

| Service | Image | Port (host) | Purpose |
|---|---|---|---|
| PostgreSQL | `supabase/postgres` | internal | Database |
| Kong | `kong:2.8.1` | **8000** | API gateway |
| GoTrue | `supabase/gotrue` | internal | Auth |
| PostgREST | `postgrest/postgrest` | internal | REST API |
| Realtime | `supabase/realtime` | internal | WebSocket |
| Storage | `supabase/storage-api` | internal | File storage |
| imgproxy | `darthsim/imgproxy` | internal | Image resize |
| pg-meta | `supabase/postgres-meta` | internal | DB metadata |
| Edge Runtime | `supabase/edge-runtime` | internal | Deno functions |
| Studio | `supabase/studio` | **3000** | Admin dashboard |
| **Frontend** | built locally | **80** | SyndeoCare web app |

---

## Requirements

- Docker Engine ≥ 24 and Docker Compose ≥ 2.20
- At least 4 GB RAM free
- A **Resend** account for email delivery → [resend.com](https://resend.com)

---

## Quick Start (local machine)

```bash
# 1. Clone the repo
git clone https://github.com/Alwahdi/shift-connect.git syndeocare
cd syndeocare

# 2. Create your .env
cp .env.example .env

# 3. Generate secure JWT keys (replaces the placeholder defaults in .env)
node scripts/generate-keys.js
# → Copy the three printed lines into .env

# 4. Set your Resend API key in .env
#    RESEND_API_KEY=re_xxxxxxxxxxxx

# 5. Start everything
docker compose up -d --build

# 6. Check all services are healthy
docker compose ps
```

Open **http://localhost** for the app and **http://localhost:3000** for Supabase Studio.

---

## Production deployment (server / VPS)

### 1. Point DNS at your server

Create two A records:
```
app.yourdomain.com  → YOUR_SERVER_IP
api.yourdomain.com  → YOUR_SERVER_IP
```

### 2. Update `.env`

```dotenv
SITE_URL=https://app.yourdomain.com
API_EXTERNAL_URL=https://api.yourdomain.com
```

### 3. Add an HTTPS reverse proxy

Put nginx or Caddy in front, terminating TLS and forwarding:
- `https://app.yourdomain.com` → `http://localhost:80` (frontend)
- `https://api.yourdomain.com` → `http://localhost:8000` (kong)
- `https://studio.yourdomain.com` → `http://localhost:3000` (optional)

Example minimal **Caddyfile**:
```
app.yourdomain.com {
    reverse_proxy localhost:80
}
api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

### 4. Rebuild the frontend with the new URL

After updating `.env`, rebuild the frontend image so the new Supabase URL is injected correctly:

```bash
docker compose up -d --build frontend
```

---

## Email setup (Resend)

All transactional emails (OTP codes, booking updates, notifications) are sent via the [Resend](https://resend.com) API directly from the Deno edge functions.

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add your API key to `.env`:
   ```dotenv
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
3. (Optional) Verify a custom domain in Resend to use `noreply@yourdomain.com` as the sender address. Then update the `from` field in:
   - `supabase/functions/send-otp-email/index.ts`
   - `supabase/functions/send-email-notification/index.ts`

---

## Common operations

### View logs
```bash
docker compose logs -f          # all services
docker compose logs -f frontend  # just the frontend
docker compose logs -f functions # edge function logs
```

### Apply new database migrations
```bash
# For a running stack, execute migrations manually:
docker compose exec db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/migrations/<filename>.sql
```

### Restart a single service
```bash
docker compose restart auth
```

### Stop everything
```bash
docker compose down
# To also delete all data:
docker compose down -v
```

### Upgrade images
```bash
docker compose pull
docker compose up -d
```

---

## Generating new JWT keys

If you ever need to rotate your JWT secret:

```bash
node scripts/generate-keys.js
```

Update `JWT_SECRET`, `ANON_KEY`, and `SERVICE_ROLE_KEY` in `.env`, then restart all services:

```bash
docker compose down && docker compose up -d
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Frontend shows "Network error" | `VITE_SUPABASE_URL` points to wrong host | Check `API_EXTERNAL_URL` in `.env`, rebuild frontend |
| OTP emails not arriving | `RESEND_API_KEY` not set | Set the key in `.env`, restart `functions` |
| Auth redirects to wrong URL | `SITE_URL` mismatch | Update `SITE_URL` in `.env`, restart `auth` |
| Studio won't load | Studio healthcheck failing | `docker compose logs studio` |
| DB migration errors | Migrations ran out of order | Check `docker compose logs db` for SQL errors |
