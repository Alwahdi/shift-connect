# SyndeoCare Mobile App

**Healthcare Staffing on the Go** — The mobile companion for SyndeoCare, built with Expo & React Native.

[![Expo](https://img.shields.io/badge/Expo-54-000020)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## ✨ Features

### For Healthcare Professionals
- 🔍 **Shift Search** — Browse and filter available shifts by role, date, and pay rate
- 📋 **Bookings** — Track upcoming and past bookings with check-in/check-out
- 💬 **Messages** — Real-time chat with clinics
- 👤 **Profile** — Manage your professional profile, documents, and credentials
- 🔔 **Real-time Notifications** — Get instant updates on booking status changes

### For Clinics & Facilities
- 📝 **Post Shifts** — Create and manage shifts with requirements
- 👥 **Manage Applicants** — Accept, decline, and track professional bookings
- 💬 **Direct Messaging** — Communicate with healthcare professionals
- 📊 **Dashboard** — Overview of posted shifts, active bookings, and applicants

### General
- 🌙 **Dark Mode** — Beautiful dark theme that's easy on the eyes
- 🌐 **Bilingual** — Full English and Arabic (RTL) support
- 📱 **Native Feel** — Haptic feedback, smooth animations, native navigation
- 🔐 **Secure** — Credentials stored in device secure storage (Keychain/Keystore)

---

## 🚀 Quick Start — Running with Expo Go

### Prerequisites

1. **Node.js 18+** installed on your computer
2. **Expo Go app** installed on your phone:
   - 📱 [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - 📱 [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the `mobile/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note**: You can find these in the web app's `.env` file at the project root. Use the same Supabase project — the mobile app connects to the same backend!

### Step 3: Start the Development Server

```bash
npx expo start
```

This will show a **QR code** in your terminal.

### Step 4: Open on Your Phone

1. **iPhone**: Open the **Camera app** and scan the QR code. It will open in Expo Go.
2. **Android**: Open **Expo Go** app and tap "Scan QR Code", then scan it.

That's it! The app will load on your phone. 🎉

---

## 📱 App Structure

```
mobile/
├── app/                         # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout (providers stack)
│   ├── index.tsx                # Auth gate / splash router
│   ├── (auth)/                  # Authentication flow
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx          # Welcome screen with branding
│   │   ├── sign-in.tsx          # Email/password login
│   │   └── sign-up.tsx          # Registration with role selection
│   ├── (onboarding)/            # Onboarding flows
│   │   ├── _layout.tsx
│   │   ├── professional.tsx     # 4-step professional onboarding
│   │   └── clinic.tsx           # 4-step clinic onboarding
│   └── (tabs)/                  # Main app with bottom tab navigation
│       ├── _layout.tsx          # Tab bar configuration
│       ├── dashboard.tsx        # Role-adaptive dashboard
│       ├── shifts.tsx           # Shift search & browse
│       ├── bookings.tsx         # Booking management
│       ├── messages.tsx         # Conversations
│       └── profile.tsx          # Profile & settings
├── src/
│   ├── components/ui/           # Reusable UI components
│   │   ├── Button.tsx           # Animated button with haptics
│   │   ├── Input.tsx            # Animated text input
│   │   ├── Card.tsx             # Versatile card component
│   │   ├── Badge.tsx            # Status badges
│   │   ├── Avatar.tsx           # User avatars with fallback
│   │   ├── EmptyState.tsx       # Empty list states
│   │   ├── LoadingScreen.tsx    # Animated loading screen
│   │   ├── SectionHeader.tsx    # Section headers
│   │   └── Divider.tsx          # Content dividers
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx       # Authentication state
│   │   ├── ThemeContext.tsx      # Dark/light theme
│   │   └── LanguageContext.tsx   # EN/AR language
│   ├── hooks/                   # Custom React hooks
│   │   ├── useProfile.ts        # Profile data fetching
│   │   └── useBookingRealtime.ts # Real-time booking subscriptions
│   ├── config/                  # App configuration
│   │   ├── constants.ts         # App constants
│   │   └── theme.ts             # Design tokens & colors
│   ├── lib/                     # Utilities
│   │   ├── supabase.ts          # Supabase client (SecureStore)
│   │   └── utils.ts             # Helper functions
│   └── i18n/                    # Internationalization
│       ├── index.ts             # i18next configuration
│       └── locales/
│           ├── en.json          # English translations
│           └── ar.json          # Arabic translations
└── app.json                     # Expo configuration
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| **Primary** | Green `#7CB53D` |
| **Accent** | Teal `#3BC4C3` |
| **Touch Targets** | Min 44px (WCAG compliant) |
| **Border Radius** | 6–24px scale |
| **Spacing** | 4px grid system |
| **Typography** | System fonts with Arabic support |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Expo SDK 54, React Native 0.81 |
| **Navigation** | Expo Router (file-based) |
| **Language** | TypeScript 5.x |
| **Backend** | Supabase (shared with web app) |
| **Auth Storage** | expo-secure-store |
| **State** | React Query 5, React Context |
| **Forms** | React Hook Form + Zod |
| **i18n** | i18next (EN + AR) |
| **Animations** | React Native Animated API |
| **Haptics** | expo-haptics |

---

## 🔗 Connecting to Your Backend

The mobile app uses the **same Supabase backend** as the web app. All database tables, authentication, and real-time subscriptions are shared.

Simply use the same Supabase URL and anon key from the web app's `.env`:
- `VITE_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 📝 Development Notes

### Admin Features
Admin functionality (user management, document verification, analytics) is **not included** in the mobile app by design. Admin features should be accessed via the web dashboard.

### RTL Support
Arabic language is fully supported with RTL-aware layouts. Language can be switched in the Profile → Settings screen.

### Offline Behavior
React Query provides automatic caching and retry logic. The app gracefully handles network errors with user-friendly messages.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/mobile-feature`
3. Make your changes in the `mobile/` directory
4. Test with `npx expo start`
5. Commit and push
6. Open a Pull Request

---

**SyndeoCare Mobile** — Healthcare Staffing, In Your Pocket. 📱
