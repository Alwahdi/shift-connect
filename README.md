# SyndeoCare.ai

**Healthcare Staffing Platform** — Connect verified healthcare professionals with clinics instantly.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.x-119EFF)](https://capacitorjs.com/)

---

## Overview

SyndeoCare is a full-stack healthcare staffing platform that connects verified medical professionals with clinics and healthcare facilities. The platform features real-time messaging, shift management, document verification, geolocation-based matching, and multi-language support (English + Arabic RTL).

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Design System](#design-system)
11. [Mobile App Deployment](#mobile-app-deployment)
12. [Self-Hosted Backend Setup](#self-hosted-backend-setup)
13. [API Reference (Edge Functions)](#api-reference)
14. [Security Model](#security-model)
15. [Contributing](#contributing)

---

## Architecture Overview

```
Frontend (Vite + React 18 + TypeScript)
    ↕ Supabase JS SDK
Backend (Supabase: PostgreSQL + Auth + Realtime + Storage + Edge Functions)
    ↕
Mobile (Capacitor: iOS + Android)
```

- **Frontend**: Single-page application with lazy-loaded routes, error boundaries, and production-optimized React Query configuration.
- **Backend**: PostgreSQL with Row Level Security, PostGIS for geolocation, real-time subscriptions, and Deno-based edge functions.
- **Mobile**: Capacitor wraps the web app for native iOS/Android deployment with native plugins for status bar, keyboard, haptics, and push notifications.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3, Radix UI, Framer Motion |
| State | React Query (TanStack), React Context |
| Routing | React Router v6 |
| Forms | React Hook Form, Zod |
| i18n | i18next (EN + AR with RTL) |
| Mobile | Capacitor 6 (iOS + Android) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Email | Resend API |
| Geolocation | PostGIS |

## Project Structure

```
├── capacitor.config.ts          # Capacitor configuration
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── API.md                   # Edge function API reference
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── SELF_HOSTING.md          # Self-hosted migration guide
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images and brand assets
│   ├── components/
│   │   ├── admin/               # Admin dashboard components
│   │   ├── booking/             # Booking management
│   │   ├── chat/                # Real-time messaging
│   │   ├── clinic/              # Clinic-specific components
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── home/                # Landing page sections
│   │   ├── layout/              # App shell (Header, Footer, Nav)
│   │   ├── notifications/       # Notification center
│   │   ├── onboarding/          # Onboarding flow
│   │   ├── shifts/              # Shift management
│   │   ├── ui/                  # Design system components (shadcn/ui)
│   │   ├── ErrorBoundary.tsx    # Global error boundary
│   │   └── PageSkeleton.tsx     # Route loading skeleton
│   ├── config/
│   │   ├── backend.ts           # Backend connection config
│   │   ├── constants.ts         # App-wide constants
│   │   ├── design-tokens.ts     # Design token definitions
│   │   └── theme.ts             # Theme configuration
│   ├── contexts/                # React Context providers
│   ├── design-system/           # Design system tokens and exports
│   ├── hooks/                   # Custom React hooks
│   ├── i18n/                    # Internationalization
│   │   └── locales/             # Translation files (en.json, ar.json)
│   ├── integrations/supabase/   # Auto-generated Supabase client & types
│   ├── lib/                     # Utility functions
│   └── pages/                   # Route pages
│       ├── dashboard/           # Role-specific dashboards
│       ├── onboarding/          # Onboarding flows
│       ├── profile/             # Profile management
│       └── shifts/              # Shift search and detail
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── functions/               # Edge functions (Deno)
│   │   ├── delete-account/
│   │   ├── send-email-notification/
│   │   ├── send-otp-email/
│   │   └── verify-otp/
│   └── migrations/              # Database migrations
└── tailwind.config.ts           # Tailwind configuration
```

## Getting Started

```bash
# Clone the repository
git clone <REPO_URL>
cd syndeocare

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

Edge function secrets:
| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Resend email service API key |
| `APP_URL` | Application URL for email links (default: `https://syndeocare.ai`) |

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Professional user profiles |
| `clinics` | Clinic/facility profiles |
| `user_roles` | Role assignments (professional, clinic, admin, super_admin) |
| `user_preferences` | Notification and display preferences |
| `shifts` | Posted shifts with location, rate, requirements |
| `bookings` | Shift bookings with status tracking |
| `ratings` | Mutual rating system |
| `documents` | Uploaded credentials and verification documents |
| `availability` | Weekly availability schedule |
| `conversations` | Chat threads |
| `messages` | Individual messages with file attachments |
| `notifications` | In-app notifications |
| `admin_notes` | Internal admin notes |
| `admin_permissions` | Granular admin permission matrix |
| `certifications` | System-managed certification types |
| `document_types` | Configurable document requirements |
| `job_roles` | Managed job role definitions |

## Authentication Flow

1. Sign up with email + password
2. OTP verification via edge function
3. Role selection during onboarding
4. JWT with role claims
5. RLS policies enforce data access

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `professional` | Browse shifts, apply, manage profile, upload documents |
| `clinic` | Post shifts, manage applicants, hire professionals |
| `admin` | Verify documents, manage users, view analytics |
| `super_admin` | Full system access, manage other admins |

## Internationalization (i18n)

- **English** (LTR) — default
- **Arabic** (RTL) — full support with Cairo font

Translation files: `src/i18n/locales/{en,ar}.json`

## Design System

Built on Tailwind CSS with semantic design tokens:

- **Primary**: Deep Purple (`#663C6D`)
- **Accent**: Teal Blue (`#56849A`)
- **Success/Warning/Destructive**: Contextual colors
- Full dark mode support
- 44px+ touch targets for mobile

## Mobile App Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete iOS and Android deployment instructions.

```bash
# Quick start
npx cap add ios && npx cap add android
npm run build && npx cap sync
npx cap open ios  # or npx cap open android
```

## Self-Hosted Backend Setup

See [docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md) for migrating to your own Supabase instance.

## API Reference

See [docs/API.md](./docs/API.md) for edge function documentation.

## Security Model

- Row Level Security (RLS) on all tables
- Role-based access control via `user_roles`
- JWT validation on all authenticated endpoints
- Content Security Policy headers
- Input validation with Zod
- File upload restrictions by type and size

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

**SyndeoCare.ai** — Healthcare Staffing, Simplified.

© 2025 SyndeoCare. All rights reserved.
