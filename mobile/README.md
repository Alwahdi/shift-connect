# Shift Connect Mobile

A polished Expo mobile app for the Shift Connect platform focused on the two supported mobile roles:

- professionals
- clinics

Admin flows are intentionally excluded from mobile and remain web-only.

## Run with Expo Go

1. Open a terminal in `/home/runner/work/shift-connect/shift-connect/mobile`
2. Install dependencies:

   ```bash
   npm install
   ```

3. Optional: configure live Supabase auth by creating `.env` from `.env.example`
4. Start Expo:

   ```bash
   npm run start
   ```

5. Install **Expo Go** on your phone
6. Scan the QR code shown in the terminal or Expo Dev Tools

## Environment variables

Create a `.env` file in `mobile/` if you want live authentication:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

If these variables are missing, the app automatically runs in preview mode so you can still explore the professional and clinic mobile experience in Expo Go.

## Useful scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
```
