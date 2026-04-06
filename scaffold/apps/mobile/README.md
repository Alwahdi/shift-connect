# SyndeoCare Mobile App

Expo SDK 54 mobile application for the SyndeoCare healthcare staffing platform.

## Tech Stack

- **Framework:** Expo SDK 54 with React Native 0.81
- **Navigation:** Expo Router v6 (file-based routing)
- **Language:** TypeScript with React 19.1
- **State:** TanStack React Query v5 + Supabase Realtime
- **Auth:** Supabase Auth with `expo-secure-store` for secure token persistence
- **i18n:** i18next + expo-localization (English & Arabic with RTL support)
- **UI:** React Native core components + `@syndeocare/ui-native` shared package

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout (providers, fonts, splash)
│   ├── +not-found.tsx      # 404 screen
│   ├── (auth)/             # Unauthenticated screens
│   │   ├── index.tsx       # Login
│   │   ├── signup.tsx      # Registration
│   │   ├── verify-otp.tsx  # OTP verification
│   │   └── verify-email.tsx
│   ├── (app)/              # Authenticated screens
│   │   ├── (tabs)/         # Bottom tab navigator
│   │   │   ├── index.tsx   # Dashboard (role-adaptive)
│   │   │   ├── shifts.tsx  # Shift search/management
│   │   │   ├── messages.tsx # Conversations
│   │   │   └── profile.tsx # Profile
│   │   ├── shift/[id].tsx  # Shift detail
│   │   ├── booking/[id].tsx # Booking detail
│   │   ├── chat/[id].tsx   # Chat
│   │   ├── professional/[id].tsx
│   │   ├── clinic/[id].tsx
│   │   ├── search/professionals.tsx
│   │   ├── settings/       # Settings screens
│   │   └── onboarding/     # Onboarding wizards
│   └── (admin)/            # Admin-only screens
├── src/
│   ├── constants/theme.ts  # Native design tokens
│   ├── lib/                # Supabase client, i18n, secure store
│   └── providers/          # AuthProvider, ThemeProvider
├── app.config.ts           # Expo dynamic config
├── eas.json                # EAS Build configuration
├── metro.config.js         # Monorepo-aware Metro bundler
└── tsconfig.json           # TypeScript config with path aliases
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Setup

```bash
# From the scaffold root
cd scaffold

# Install all dependencies
pnpm install

# Copy environment variables
cp apps/mobile/.env.example apps/mobile/.env
# Edit .env with your Supabase URL and anon key

# Start the Expo dev server
pnpm --filter @syndeocare/mobile dev
```

### Running on Devices

```bash
# iOS Simulator
pnpm --filter @syndeocare/mobile dev:ios

# Android Emulator
pnpm --filter @syndeocare/mobile dev:android
```

## Building

### Development Build (with dev client)

```bash
cd apps/mobile
eas build --profile development --platform ios
```

### Preview (internal testing)

```bash
eas build --profile preview --platform all
```

### Production

```bash
eas build --profile production --platform all
```

### OTA Update

```bash
eas update --branch production --message "Fix: description"
```

## Shared Packages

The mobile app consumes these monorepo packages:

| Package | Usage |
|---------|-------|
| `@syndeocare/design-tokens` | Colors, spacing, typography tokens |
| `@syndeocare/i18n` | Translation files (en, ar) |
| `@syndeocare/config` | Environment config & Zod schemas |
| `@syndeocare/database` | Supabase query helpers |
| `@syndeocare/storage` | File upload utilities |
| `@syndeocare/analytics` | Event tracking |
| `@syndeocare/ui-native` | React Native UI components |

## Key Features

- **Role-adaptive UI:** Professional, Clinic, and Admin roles see different dashboards and tabs
- **Real-time messaging:** Supabase Realtime for live chat
- **Secure auth:** JWT tokens stored in device keychain via expo-secure-store
- **Dark mode:** System preference detection with manual override
- **RTL support:** Full Arabic language support with layout mirroring
- **Haptic feedback:** Tactile responses on key interactions
- **OTA updates:** Instant JavaScript bundle updates without app store review

## Environment Variables

See `.env.example` for required variables:

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `EXPO_PUBLIC_APP_URL` — Web app URL for deep linking
