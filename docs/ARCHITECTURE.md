# SyndeoCare — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐                │
│  │  Web App  │  │ iOS App  │  │ Android   │                │
│  │ (Vite+   │  │ (Cap-    │  │ App (Cap- │                │
│  │  React)  │  │ acitor)  │  │ acitor)   │                │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘                │
│       └──────────────┼──────────────┘                       │
│                      │                                      │
│              Supabase JS SDK                                │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                Backend Layer (Supabase)                      │
│  ┌───────────────────┼────────────────────────────────┐     │
│  │            Supabase Gateway                        │     │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐ ┌──────┐ │     │
│  │  │ Auth │ │ REST │ │Realtime│ │Storage│ │Edge  │ │     │
│  │  │      │ │(Post-│ │(Web-   │ │(S3)   │ │Fns   │ │     │
│  │  │      │ │gREST)│ │Socket) │ │       │ │(Deno)│ │     │
│  │  └──┬───┘ └──┬───┘ └───┬────┘ └───┬───┘ └──┬───┘ │     │
│  └─────┼────────┼─────────┼──────────┼────────┼──────┘     │
│        └────────┼─────────┼──────────┘        │            │
│           ┌─────┴─────────┴──────┐     ┌──────┴──────┐     │
│           │    PostgreSQL DB     │     │ External    │     │
│           │  (with RLS + PostGIS)│     │ APIs        │     │
│           └──────────────────────┘     │ (Resend,    │     │
│                                        │  etc.)      │     │
│                                        └─────────────┘     │
└────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + Radix UI primitives |
| Animation | Framer Motion |
| State Management | React Query (TanStack) + React Context |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod validation |
| i18n | i18next (English + Arabic RTL) |
| Mobile | Capacitor (iOS + Android) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Email | Resend API |
| Geolocation | PostGIS extension |

## Database Schema

### Core Tables

- **profiles** — Professional user profiles (name, qualifications, location, rating)
- **clinics** — Clinic/facility profiles (name, address, verification status)
- **user_roles** — Role assignments (professional, clinic, admin, super_admin)
- **user_preferences** — Notification and display preferences

### Operational Tables

- **shifts** — Posted shifts with location, rate, requirements
- **bookings** — Shift bookings with status tracking, check-in/out
- **ratings** — Mutual rating system (post-booking)
- **documents** — Uploaded credentials and verification documents
- **availability** — Weekly availability schedule per professional

### Communication Tables

- **conversations** — Chat threads between professionals and clinics
- **messages** — Individual messages with file attachment support
- **notifications** — In-app notification system

### Admin Tables

- **admin_notes** — Internal admin notes on users
- **admin_permissions** — Granular admin permission matrix
- **certifications** — System-managed certification types
- **document_types** — Configurable document type requirements
- **job_roles** — Managed job role definitions

## Authentication Flow

1. User signs up with email + password
2. OTP verification code sent via edge function
3. User verifies OTP → account activated
4. Role selected during onboarding (professional or clinic)
5. JWT issued with role claims
6. RLS policies enforce data access per role

## Security Model

- Row Level Security (RLS) enabled on ALL tables
- Role-based access control via `user_roles` table
- `has_role()` and `is_super_admin()` database functions for policy checks
- All edge functions validate JWT before processing
- File uploads restricted by type and size
- CORS configured on all edge functions
