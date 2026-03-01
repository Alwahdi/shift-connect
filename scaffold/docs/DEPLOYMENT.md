# SyndeoCare — Deployment Guide

## Deployment Options

| Platform | Best For | Cost |
|----------|----------|------|
| **Lovable Cloud** | Fastest, zero-config | Free tier available |
| **Vercel** | Custom domains, edge | Free tier available |
| **Netlify** | Alternative to Vercel | Free tier available |
| **Docker + VPS** | Full control, self-hosted | ~$5/mo (DigitalOcean) |
| **Cloudflare Pages** | Global CDN, Workers | Free tier available |

## Option 1: Lovable Cloud (Recommended)

Already deployed! Just click **Publish** in Lovable.

- Frontend: `https://syndeocareapp.lovable.app`
- Custom domain: Settings → Domains

## Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_PROJECT_ID

# Production deploy
vercel --prod
```

### vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

## Option 3: Docker

```bash
# Build image
docker build -f infrastructure/docker/Dockerfile \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
  --build-arg VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
  -t syndeocare:latest .

# Run
docker run -p 3000:80 syndeocare:latest
```

## Option 4: Static Export (Any CDN)

```bash
# Build
pnpm build

# Upload dist/ folder to any static hosting:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Blob Storage
# - Any web server
```

## Mobile Deployment

### iOS (App Store)

```bash
# Build web assets
pnpm build

# Sync to Capacitor
npx cap sync ios

# Open Xcode
npx cap open ios

# Archive and submit via Xcode
```

### Android (Play Store)

```bash
# Build web assets
pnpm build

# Sync to Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK/AAB and submit via Play Console
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring active (Sentry)
- [ ] Analytics tracking (PostHog)
- [ ] Database backups scheduled
- [ ] Health check endpoint responding
- [ ] Email sending working
- [ ] Mobile deep links configured
