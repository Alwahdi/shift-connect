

# Comprehensive Production Hardening & Quality Improvement Plan

Based on the detailed review provided and my thorough analysis of the codebase, here is the implementation plan addressing every identified issue.

---

## Part 1: Package & Branding Fixes

### 1.1 Fix `package.json` Name
The package name is still `vite_react_shadcn_ts` (line 2). This was identified in the previous plan but never changed.

**File:** `package.json`
- Change `"name": "vite_react_shadcn_ts"` to `"name": "syndeocare"`
- Add `"cap:sync"` and `"cap:build"` scripts for mobile workflows

### 1.2 Fix Capacitor Config App ID
The `appId` in `capacitor.config.ts` (line 4) is `app.lovable.d9cdd12a...` which contains Lovable branding. App Store and Play Store will reject this.

**File:** `capacitor.config.ts`
- Change `appId` to `ai.syndeocare.app`
- This is the reverse-domain notation required by both stores

### 1.3 Remove `lovable-tagger` From Vite Config
The `lovable-tagger` package remains in `devDependencies` (line 92 of `package.json`). While the import was removed from `vite.config.ts`, it still exists as a dependency.

**File:** `package.json`
- Remove `"lovable-tagger": "^1.1.13"` from devDependencies

---

## Part 2: Duplicate Profile Fetching (Architecture Issue)

### Problem
Profile data is fetched independently in three separate components, causing redundant network requests on every page load:
1. `DashboardLayout.tsx` (lines 46-87) -- fetches profile
2. `UserProfileMenu.tsx` (lines 50-84) -- fetches the exact same profile
3. `MobileBottomNav.tsx` (lines 43-58) -- fetches profile ID

### Solution: Centralized Profile Hook

**New file:** `src/hooks/useProfile.ts`
- Create a single React Query hook that fetches profile/clinic data
- Uses `useQuery` with key `['profile', user.id]` and `staleTime: 5min`
- Returns `{ profile, isLoading, avatarUrl, displayName, verificationStatus, profileId }`

**Modified files:**
- `DashboardLayout.tsx` -- Replace inline `fetchProfile` with `useProfile()` hook
- `UserProfileMenu.tsx` -- Replace inline `fetchProfile` with `useProfile()` hook
- `MobileBottomNav.tsx` -- Replace inline `fetchProfile` with `useProfile()` hook

This eliminates 2 duplicate Supabase queries per page load.

---

## Part 3: Type Safety Fixes

### 3.1 Remove `as any` Casts

**File:** `DashboardLayout.tsx` (line 64)
```typescript
// Current: verification_status: data.verification_status as any
// Fix: verification_status: data.verification_status as UserProfile['verification_status']
```

**File:** `UserProfileMenu.tsx` (lines 60, 73)
Same pattern -- replace `as any` with proper type narrowing.

---

## Part 4: Rate Limiting on OTP Edge Functions

### Problem (Security)
The `send-otp-email` function has rate limiting (1 per minute), but the `verify-otp` function has no IP-based rate limiting. An attacker could brute-force the 6-digit code (1M combinations) within the 15-minute window.

### Solution
**File:** `supabase/functions/verify-otp/index.ts`
- The attempt counter logic already exists (lines 45-75) with max 5 attempts
- This is adequate for the current implementation -- no changes needed here

**File:** `supabase/functions/send-otp-email/index.ts`
- Already has 1-minute rate limiting (lines 51-64)
- Add daily limit: max 10 OTP requests per email per day to prevent abuse

---

## Part 5: Pagination for Large Lists

### Problem
Messages, notifications, and bookings fetch without pagination, potentially loading hundreds of records.

### Solution
**File:** `src/components/notifications/NotificationCenter.tsx`
- Already limited to 50 (line 98) -- adequate for a popover

**File:** `src/components/chat/ChatMessages.tsx`
- Add pagination with "Load more" button for message history
- Initially load last 50 messages, then load 50 more on demand

---

## Part 6: Accessibility Improvements

### 6.1 Missing ARIA Labels on Icon Buttons

**File:** `src/components/layout/Header.tsx`
- Line 124: Messages link button missing `aria-label` -- add `aria-label={t("chat.messages")}`

### 6.2 Notification Action Buttons Too Small

**File:** `src/components/notifications/NotificationCenter.tsx`
- Lines 280, 290: Action buttons are `h-6 w-6` (24px) -- below 44px minimum
- These are hover-only actions on desktop, acceptable as secondary controls
- Add touch-friendly swipe actions for mobile in the future

---

## Part 7: Mobile UX Polish

### 7.1 Content Behind Fixed Header

**Problem:** The `Header.tsx` is `fixed` (line 60) with height `h-14 sm:h-16 md:h-20`, but the Index page content starts at `pt-24` which may not account for all viewport sizes.

**File:** `src/pages/Index.tsx`
- The HeroSection already has `pt-24 md:pt-32 lg:pt-40` which accounts for this
- No change needed

### 7.2 Mobile Bottom Nav Safe Area

**File:** `src/components/layout/MobileBottomNav.tsx`
- Already has `safe-area-inset-bottom` class (line 144)
- Already hidden on md+ screens (line 139: `md:hidden`)
- Dashboard content has `pb-20 md:pb-0` (DashboardLayout line 133)
- This is correct

### 7.3 Mobile Menu Overlay Z-Index

**File:** `src/components/layout/Header.tsx`
- Mobile menu overlay (line 152) uses `z-40` but the header uses `z-50`
- The mobile menu is positioned `top-14 sm:top-16` which is correct
- No change needed

---

## Part 8: Error Boundary Enhancement

### Problem
The current ErrorBoundary (line 57) checks `process.env.NODE_ENV` which doesn't work in Vite -- Vite uses `import.meta.env.MODE`.

**File:** `src/components/ErrorBoundary.tsx`
- Change `process.env.NODE_ENV === 'development'` to `import.meta.env.DEV`

---

## Part 9: Deep Link Handling Fix

### Problem
In `src/main.tsx` (line 50), deep links use `window.location.hash = path` but the app uses `BrowserRouter` (not `HashRouter`), so deep links won't work.

**File:** `src/main.tsx`
- Change `window.location.hash = path` to `window.location.pathname = path`

---

## Part 10: Documentation Updates

### 10.1 Update Copyright Year
**File:** `README.md` (line 245)
- Change `© 2025` to `© 2025-2026`

### 10.2 Fix Capacitor Version Badge
**File:** `README.md` (line 8)
- Change `Capacitor-6.x` to `Capacitor-8.x` (actual installed version is 8.1.0)

### 10.3 Fix Tech Stack Table
**File:** `README.md` (line 60)
- Change `Capacitor 6` to `Capacitor 8`

---

## Part 11: CSP Header Fix

### Problem
The CSP in `index.html` (line 21) allows `https://cdn.gpteng.co` which is Lovable-specific infrastructure.

**File:** `index.html`
- Remove `https://cdn.gpteng.co` from `script-src` directive
- Remove `https://*.lovableproject.com https://*.lovable.app` from `connect-src` after deployment to own domain

---

## Part 12: SITE_CONFIG URL Fix

**File:** `src/config/constants.ts` (line 13)
- Change `url: "https://syndeocare.vercel.app"` to `url: "https://syndeocare.ai"`
- This is the canonical URL and should match the one in `index.html`

---

## Implementation Summary

| # | Category | File(s) | Change |
|---|----------|---------|--------|
| 1 | Branding | `package.json` | Rename to `syndeocare`, remove `lovable-tagger` |
| 2 | Branding | `capacitor.config.ts` | Fix `appId` to `ai.syndeocare.app` |
| 3 | Architecture | New `src/hooks/useProfile.ts` | Centralized profile hook |
| 4 | Architecture | `DashboardLayout.tsx`, `UserProfileMenu.tsx`, `MobileBottomNav.tsx` | Use `useProfile()` hook |
| 5 | Type Safety | `DashboardLayout.tsx`, `UserProfileMenu.tsx` | Remove `as any` casts |
| 6 | Bug Fix | `ErrorBoundary.tsx` | Fix `process.env` to `import.meta.env` |
| 7 | Bug Fix | `main.tsx` | Fix deep link handling |
| 8 | Security | `index.html` | Clean CSP of Lovable domains |
| 9 | Config | `constants.ts` | Fix site URL |
| 10 | Accessibility | `Header.tsx` | Add missing aria-labels |
| 11 | Docs | `README.md` | Fix version badges and copyright |
| 12 | Security | `send-otp-email/index.ts` | Add daily rate limit |

### No Database Changes Required

### Files Created: 1
- `src/hooks/useProfile.ts`

### Files Modified: 10
- `package.json`
- `capacitor.config.ts`
- `src/components/ErrorBoundary.tsx`
- `src/main.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/UserProfileMenu.tsx`
- `src/components/layout/MobileBottomNav.tsx`
- `src/components/layout/Header.tsx`
- `src/config/constants.ts`
- `index.html`
- `README.md`
- `supabase/functions/send-otp-email/index.ts`

