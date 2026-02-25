

# Mobile App Readiness, Self-Hosted Migration & Professional Documentation

## Overview

This plan covers three major areas: (1) making the app fully deployable to Apple App Store and Google Play via Capacitor, (2) preparing the codebase for self-hosted backend migration, (3) removing all Lovable branding and creating professional documentation.

---

## Part 1: Capacitor Mobile App Setup

### 1.1 Install Capacitor Dependencies

Add to `package.json`:
- `@capacitor/core`
- `@capacitor/cli` (dev dependency)
- `@capacitor/ios`
- `@capacitor/android`
- `@capacitor/status-bar` (native status bar control)
- `@capacitor/splash-screen` (native splash screen)
- `@capacitor/keyboard` (keyboard handling for forms)
- `@capacitor/haptics` (haptic feedback for mobile nav)
- `@capacitor/push-notifications` (for App Store push requirement)
- `@capacitor/app` (app lifecycle, deep linking)
- `@capacitor/browser` (in-app browser for OAuth)

### 1.2 Create Capacitor Configuration

**New file: `capacitor.config.ts`**
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d9cdd12a438c46568d56af72b6f76e2c',
  appName: 'SyndeoCare',
  webDir: 'dist',
  server: {
    url: 'https://d9cdd12a-438c-4656-8d56-af72b6f76e2c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#663C6D',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#663C6D',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

### 1.3 Mobile-Specific Adaptations

**Modify `index.html`:**
- Add mobile meta tags required by App Store/Play Store:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style`
  - `theme-color`
  - CSP meta tag for security
  - Viewport with `viewport-fit=cover` for notched devices

**Modify `src/main.tsx`:**
- Import and initialize Capacitor plugins (StatusBar, SplashScreen, Keyboard)
- Handle deep links via `@capacitor/app`
- Configure safe area insets

**Modify `src/index.css`:**
- Add `env(safe-area-inset-*)` padding for notched devices
- Ensure `body` has proper mobile overscroll behavior
- Add `-webkit-tap-highlight-color: transparent`

### 1.4 App Store Requirements

**New file: `src/components/ErrorBoundary.tsx`**
- React Error Boundary to prevent white-screen crashes (App Store rejection reason)
- Retry button with branded styling

**Modify `src/App.tsx`:**
- Wrap entire app in ErrorBoundary
- Add `React.lazy()` for all route imports with `<Suspense>` fallback
- Configure QueryClient with production defaults (`staleTime: 5min`, `retry: 1`)

---

## Part 2: Self-Hosted Backend Preparation

### 2.1 Centralized Backend Configuration

**New file: `src/config/backend.ts`**
```typescript
export const BACKEND_CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  // When self-hosting, change these environment variables
  // to point to your own Supabase instance
} as const;
```

This file documents the migration path clearly so switching to a self-hosted instance only requires changing environment variables.

### 2.2 Edge Function URL Hardcoding Fix

**Modify `supabase/functions/send-email-notification/index.ts`:**
- Replace all 5 hardcoded `syndeocareapp.lovable.app` URLs with a configurable `APP_URL` environment variable
- Fall back to `https://syndeocare.ai` as default

### 2.3 Auth Redirect Configuration

**Modify `src/config/constants.ts`:**
- Update `AUTH_CONFIG.redirectUrl` to use `window.location.origin` dynamically instead of hardcoded vercel URL
- This ensures OAuth works regardless of deployment target

---

## Part 3: Remove All Lovable Branding

### 3.1 Files to Modify

| File | Change |
|------|--------|
| `package.json` | Change `name` from `vite_react_shadcn_ts` to `syndeocare` |
| `vite.config.ts` | Remove `lovable-tagger` import and usage (keep as dev dep to avoid build errors) |
| `README.md` | Complete rewrite (see below) |
| `index.html` | Already clean - no Lovable references |

### 3.2 Professional README.md

Complete rewrite covering:

```text
# SyndeoCare.ai

## Healthcare Staffing Platform

### Overview
SyndeoCare is a full-stack healthcare staffing platform...

### Table of Contents
1. Architecture Overview
2. Tech Stack
3. Project Structure
4. Getting Started
5. Environment Variables
6. Database Schema
7. Authentication Flow
8. User Roles & Permissions
9. Internationalization (i18n)
10. Design System & Tokens
11. Mobile App Deployment
12. Self-Hosted Backend Setup
13. API Reference (Edge Functions)
14. Security Model
15. Contributing

### Architecture Overview
- Frontend: Vite + React 18 + TypeScript
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- Styling: Tailwind CSS + Radix UI + Framer Motion
- State: React Query + React Context
- i18n: i18next with Arabic RTL support
- Mobile: Capacitor (iOS + Android)

### Project Structure (directory tree)

### Database Schema (all tables documented)

### Authentication Flow
- Email + Password with OTP verification
- Role-based access (professional, clinic, admin, super_admin)
- RLS policies on all tables

### Mobile Deployment
- Prerequisites (Xcode, Android Studio)
- Build steps for iOS and Android
- App Store submission checklist

### Self-Hosted Backend
- Step-by-step migration from Lovable Cloud to self-hosted Supabase
- Environment variable mapping
- Edge function deployment instructions
```

### 3.3 New Documentation Files

**New file: `docs/ARCHITECTURE.md`** - Detailed system architecture
**New file: `docs/DEPLOYMENT.md`** - Step-by-step deployment guide for web + mobile
**New file: `docs/SELF_HOSTING.md`** - Self-hosted backend migration guide
**New file: `docs/API.md`** - Edge function API reference

---

## Part 4: Code Quality & Production Hardening

### 4.1 Error Boundaries

**New file: `src/components/ErrorBoundary.tsx`**
- Global error boundary with SyndeoCare branding
- "Something went wrong" screen with retry button
- Error logging (console in dev, could send to analytics in prod)

### 4.2 Route-Level Code Splitting

**Modify `src/App.tsx`:**
- Convert all 20+ page imports to `React.lazy()`
- Wrap `<Routes>` in `<Suspense>` with branded loading skeleton
- Add ErrorBoundary wrapper

### 4.3 Production QueryClient

**Modify `src/App.tsx`:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4.4 Loading Skeleton

**New file: `src/components/PageSkeleton.tsx`**
- Branded full-page skeleton for route transitions
- Uses SyndeoCare logo and spinner

---

## Summary of All Changes

### New Files (7)
| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration for iOS/Android |
| `src/components/ErrorBoundary.tsx` | Global error boundary |
| `src/components/PageSkeleton.tsx` | Route loading skeleton |
| `src/config/backend.ts` | Backend configuration docs |
| `docs/ARCHITECTURE.md` | System architecture |
| `docs/DEPLOYMENT.md` | Deployment guide |
| `docs/SELF_HOSTING.md` | Self-hosting migration |

### Modified Files (8)
| File | Changes |
|------|---------|
| `package.json` | Rename + add Capacitor deps + add build scripts |
| `index.html` | Add mobile meta tags + CSP |
| `vite.config.ts` | Remove lovable-tagger usage |
| `src/App.tsx` | ErrorBoundary + lazy loading + QueryClient config |
| `src/main.tsx` | Capacitor plugin initialization |
| `src/config/constants.ts` | Dynamic redirect URLs |
| `supabase/functions/send-email-notification/index.ts` | Replace hardcoded URLs |
| `README.md` | Complete professional rewrite |

### Zero Database Changes Required

---

## Post-Implementation Steps (User Action Required)

After these changes are implemented, to deploy to app stores:

1. Export project to GitHub via Settings
2. Clone the repository locally
3. Run `npm install`
4. Run `npx cap add ios` and/or `npx cap add android`
5. Run `npm run build && npx cap sync`
6. Open in Xcode (`npx cap open ios`) or Android Studio (`npx cap open android`)
7. Configure signing certificates and submit to stores

For self-hosted backend migration:
1. Set up your own Supabase instance
2. Run all migrations from `supabase/migrations/`
3. Deploy edge functions with `supabase functions deploy`
4. Update environment variables to point to your instance

