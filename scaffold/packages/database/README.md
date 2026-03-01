# @syndeocare/database

Database schema, migrations, types, and utilities for SyndeoCare.

## Overview

- **Database**: PostgreSQL (via Supabase)
- **Extensions**: PostGIS (geospatial), pgcrypto
- **ORM**: Supabase JS Client (no external ORM)

## Schema

```
public/
├── profiles                     # Professional profiles
├── clinics                      # Clinic profiles
├── shifts                       # Job shift postings
├── bookings                     # Shift bookings
├── shift_invitations            # Direct invitations
├── conversations                # Chat conversations
├── messages                     # Chat messages
├── documents                    # Uploaded documents
├── ratings                      # Reviews & ratings
├── notifications                # In-app notifications
├── availability                 # Professional availability
├── user_roles                   # Role assignments
├── admin_permissions            # Admin access control
├── admin_notes                  # Admin notes on users
├── user_preferences             # User settings
├── job_roles                    # Configurable job roles
├── document_types               # Configurable doc types
├── certifications               # Configurable certifications
└── email_verification_codes     # OTP verification
```

## Structure

```
database/
├── migrations/                  # SQL migration files (ordered)
│   ├── 0001_create_profiles.sql
│   ├── 0002_create_clinics.sql
│   ├── 0003_create_shifts.sql
│   ├── 0004_create_bookings.sql
│   ├── 0005_create_messaging.sql
│   ├── 0006_create_documents.sql
│   ├── 0007_create_ratings.sql
│   ├── 0008_create_notifications.sql
│   ├── 0009_create_admin.sql
│   └── 0010_create_rls_policies.sql
├── seed/                        # Seed data
│   ├── job_roles.sql
│   ├── document_types.sql
│   ├── certifications.sql
│   └── test_data.sql
├── functions/                   # Database functions
│   ├── find_shifts_within_distance.sql
│   ├── check_shift_overlap.sql
│   ├── create_notification.sql
│   └── has_role.sql
├── types/                       # Generated TypeScript types
│   └── supabase.ts              # Auto-generated (DO NOT EDIT)
├── rls/                         # RLS policies documentation
│   └── policies.md
└── package.json
```

## RLS Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own profile | Own profile | Own profile | — |
| clinics | Own clinic | Own clinic | Own clinic | — |
| shifts | All (public) | Own clinic | Own clinic | Own clinic |
| bookings | Involved parties | Professional | Involved | — |
| messages | Conversation member | Conversation member | — | — |
| documents | Own + admin | Own | Own + admin | Own |
| notifications | Own | System only | Own (mark read) | — |

## Geospatial Queries

```sql
-- Find shifts within X km of a location
SELECT * FROM find_shifts_within_distance(
  user_lat := 15.3694,
  user_lng := 44.1910,
  max_distance_km := 50
);
```
