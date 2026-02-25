# SyndeoCare — Deployment Guide

## Web Deployment

The web app is automatically deployed via Lovable. Published URL: `https://syndeocareapp.lovable.app`

To deploy to a custom domain:
1. Go to Project → Settings → Domains
2. Add your custom domain (e.g., `app.syndeocare.ai`)
3. Configure DNS records as instructed

## Mobile App Deployment

### Prerequisites

- **iOS**: macOS with Xcode 15+ and an Apple Developer account ($99/year)
- **Android**: Android Studio and a Google Play Developer account ($25 one-time)
- Node.js 18+ and npm

### Setup Steps

```bash
# 1. Export project to GitHub via Lovable Settings
# 2. Clone the repository
git clone <YOUR_REPO_URL>
cd syndeocare

# 3. Install dependencies
npm install

# 4. Add native platforms
npx cap add ios
npx cap add android

# 5. Build the web app
npm run build

# 6. Sync to native projects
npx cap sync
```

### iOS Deployment

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select your Team in Signing & Capabilities
# 2. Set Bundle Identifier to: ai.syndeocare.app (or your preference)
# 3. Select a real device or simulator
# 4. Product → Archive → Distribute App → App Store Connect
```

#### iOS App Store Checklist

- [ ] App icons (1024x1024 + all sizes)
- [ ] Launch screen configured
- [ ] Privacy descriptions in Info.plist (camera, photos, location, notifications)
- [ ] App Store screenshots (6.7", 6.5", 5.5" iPhones + iPad)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App description and keywords
- [ ] Age rating questionnaire completed

### Android Deployment

```bash
# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle / APK
# 2. Create or select a keystore
# 3. Build AAB (Android App Bundle)
# 4. Upload to Google Play Console
```

#### Google Play Checklist

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots for phone and tablet
- [ ] Privacy policy URL
- [ ] App description (short + full)
- [ ] Content rating questionnaire
- [ ] Target audience and content
- [ ] Signed AAB uploaded

### Hot Reload During Development

The `capacitor.config.ts` is pre-configured with a live server URL for development. When building for production/store submission, remove the `server` block:

```typescript
// capacitor.config.ts — PRODUCTION
const config: CapacitorConfig = {
  appId: 'ai.syndeocare.app',
  appName: 'SyndeoCare',
  webDir: 'dist',
  // Remove 'server' block for production builds
  plugins: { /* ... */ },
};
```

### Updating the App

After making changes:

```bash
npm run build
npx cap sync
# Then rebuild in Xcode / Android Studio
```

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
