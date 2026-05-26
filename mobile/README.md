# Shift-Connect Mobile

Full-featured Expo SDK 54 mobile application for the **Shift-Connect / SyndeoCare** healthcare staffing platform. Built with Expo Router, TypeScript, Supabase, and TanStack React Query.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | ~54.0.0 | Native app runtime |
| Expo Router | ~4.0.x | File-based navigation |
| TypeScript | strict | Type safety |
| Supabase | ^2.49 | Auth + Realtime DB |
| TanStack React Query | ^5 | Data fetching + caching |
| React Hook Form + Zod | ^7 / ^3 | Form validation |
| `@expo/vector-icons` | Ionicons | Icons |

## Quick Start

The `.env` file is pre-configured for the existing Supabase project. Just install and run:

```bash
cd mobile
npm install
npm run start
```

Then open with **Expo Go** on your iOS/Android device or an emulator.

### Manual Environment Setup

If you need to point to a different Supabase project, edit `mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## App Architecture

```
app/
├── _layout.tsx          → Root: QueryClient + AuthProvider + RouteGuard
├── index.tsx            → Entry redirect (handled by RouteGuard)
├── (auth)/              → Public auth screens (sign-in, sign-up)
├── onboarding/          → Role-based onboarding (clinic, professional)
├── (clinic)/            → Clinic tab group (5 tabs)
│   ├── index            → Dashboard (stats, recent shifts, FAB)
│   ├── shifts           → Full shift list + create
│   ├── search           → Search healthcare professionals
│   ├── messages         → Conversations list
│   └── profile          → Clinic profile + edit
├── (professional)/      → Professional tab group (5 tabs)
│   ├── index            → Dashboard (stats, availability toggle)
│   ├── browse           → Browse + filter open shifts
│   ├── bookings         → My bookings (Upcoming / Past)
│   ├── messages         → Conversations list
│   └── profile          → Professional profile + edit
├── conversation/[id]    → Full chat screen with real-time messages
├── shift/[id]           → Shift detail + apply / manage applicants
└── notifications        → Notifications centre
```

## Features

### Authentication
- Email + password sign-in with validation
- Sign-up with role selector (Professional / Clinic) as interactive radio cards
- Automatic redirect after login based on role + onboarding status

### Onboarding
- **Professional**: full name, phone, specialties, hourly rate, bio
- **Clinic**: clinic name, phone, address, description

### Clinic
- Dashboard: active shifts, monthly spend, avg rating, fill rate
- Verification status banner
- Create shift sheet (role, date, time, rate, description, urgency)
- Shift management: view applicants, confirm applicant + auto-fill shift
- Search professionals by name/specialty
- Messaging with professionals

### Professional
- Dashboard: upcoming shifts, total earnings, rating, completed count
- Availability toggle (visible to clinics in real time)
- Browse & filter open shifts
- Apply for shifts (duplicate-check included)
- Booking lifecycle: check-in / check-out actions
- Messaging with clinics

### Shared
- Full chat UI with real-time Supabase channel subscription
- Shift detail page (usable by both roles)
- Notifications centre with unread badges
- Safe-area aware layouts for iOS notch + Android nav

## Design System

Brand colours from the SyndeoCare design token set:

| Token | Hex |
|---|---|
| Primary (Deep Purple) | `#663C6D` |
| Accent (Teal Blue) | `#56849A` |
| Background | `#F5F7F9` |
| Card | `#FFFFFF` |
| Text | `#2D1A33` |
| Muted | `#8B9299` |
| Success | `#2D9E68` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |

## Scripts

```bash
npm run start          # Expo dev server
npm run android        # Run on Android device/emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in browser (Metro)
npm run typecheck      # TypeScript type-check (no emit)
```
