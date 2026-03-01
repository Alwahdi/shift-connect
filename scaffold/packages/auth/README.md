# @syndeocare/auth

Authentication utilities for SyndeoCare — built on Supabase Auth.

## Overview

- **Provider**: Supabase Auth
- **Methods**: Email/Password, OTP, Google OAuth (planned)
- **Email verification**: Required (no auto-confirm)
- **Roles**: professional, clinic, admin, super_admin

## Structure

```
auth/
├── src/
│   ├── provider.tsx             # AuthProvider context
│   ├── hooks/
│   │   ├── useAuth.ts           # Core auth hook
│   │   ├── useProfile.ts        # Profile data hook
│   │   └── usePermissions.ts    # Admin permissions hook
│   ├── guards/
│   │   ├── RequireAuth.tsx      # Route guard
│   │   ├── RequireRole.tsx      # Role-based guard
│   │   └── RequireOnboarding.tsx # Onboarding guard
│   ├── utils/
│   │   ├── session.ts           # Session management
│   │   └── roles.ts             # Role utilities
│   └── types.ts                 # Auth types
└── package.json
```

## Auth Flow

```
1. User signs up (email + password + role selection)
   └── Email verification sent (OTP)
       └── User verifies OTP
           └── Profile created in profiles/clinics table
               └── Onboarding flow starts
                   └── Onboarding completed
                       └── Dashboard access granted
```

## Role Hierarchy

```
super_admin
  └── admin (scoped by admin_permissions)
      ├── professional
      └── clinic
```

## Usage

```tsx
import { useAuth } from "@syndeocare/auth";

function Dashboard() {
  const { user, userRole, signOut, isOnboardingComplete } = useAuth();
  
  if (!user) return <Navigate to="/auth" />;
  if (!isOnboardingComplete) return <Navigate to="/onboarding" />;
  
  return <DashboardContent />;
}
```

## Security Rules

1. **Never** auto-confirm email signups
2. **Always** validate role on server-side (RLS + database functions)
3. **Never** trust client-side role claims
4. OTP codes expire after 10 minutes
5. Maximum 3 OTP attempts before lockout
