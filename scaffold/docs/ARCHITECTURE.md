# SyndeoCare — System Architecture

## Overview

SyndeoCare is a healthcare staffing platform connecting medical professionals with clinics in Yemen. It follows a **serverless-first** architecture built on React + Supabase.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├──────────┬──────────┬──────────┬────────────────────────────┤
│  Web App │  iOS App │ Android  │  Admin Dashboard            │
│ (React)  │(Capacitor)│(Capacitor)│  (React)                  │
└────┬─────┴────┬─────┴────┬─────┴──────┬─────────────────────┘
     │          │          │            │
     ▼          ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Database │  │ Storage  │  │ Realtime │   │
│  │          │  │(Postgres)│  │          │  │          │   │
│  │• Email   │  │• PostGIS │  │• Avatars │  │• Chat    │   │
│  │• OTP     │  │• RLS     │  │• Docs    │  │• Notifs  │   │
│  │• OAuth   │  │• Triggers│  │• Media   │  │• Status  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Edge Functions (Deno)                    │   │
│  │  • send-email-notification                           │   │
│  │  • send-otp-email                                    │   │
│  │  • verify-otp                                        │   │
│  │  • delete-account                                    │   │
│  │  • health-check                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → React Component → Supabase Client → RLS Check → Database
                                                         ↓
User UI ← React Query Cache ← Supabase Response ← PostgreSQL
```

## Security Model

1. **Authentication**: Supabase Auth (email/OTP, email verification required)
2. **Authorization**: Row Level Security (RLS) on every table
3. **Role-Based Access**: user_roles table + has_role() function
4. **Admin Scoping**: admin_permissions table for granular access
5. **API Security**: Edge functions validate auth tokens

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No SSR | React SPA | Simpler, Capacitor-compatible |
| No ORM | Supabase JS | Direct PostgreSQL, less abstraction |
| PostGIS | Geospatial | Shift proximity search in Yemen |
| RLS everywhere | Security-first | Zero-trust data access |
| Edge functions | Deno | Serverless, auto-scaling |
| i18next | Localization | Full RTL Arabic support |
| Capacitor | Mobile | Single codebase for web + mobile |
