# Bug Fixes and Feature Implementation - Completed

## Changes Implemented

### 1. ✅ Storybook Removal
- Removed all Storybook dependencies (10 packages)
- Deleted `.storybook/` folder and `src/stories/` folder
- Updated `vercel.json` to simple SPA config (no Storybook build)

### 2. ✅ Navigation Consistency
- Updated `DashboardHeader.tsx` to use actual SyndeoCare logo image
- Added functional `NotificationCenter` component (replaces static bell)
- Made avatar clickable → links to profile page

### 3. ✅ Auth Page Logo Optimization
- Changed from public URL to ES6 import for white logo
- Vite can now optimize/preload the asset for faster loading

### 4. ✅ Chat Filtering Fix
- Added `profileId` prop to `ChatList` component
- Conversations now filtered by user's profile ID
- Users only see their own conversations

### 5. ✅ Shift Proposal Deadline Feature
- Added `proposal_deadline` column to shifts table (database migration)
- Updated `CreateShiftModal.tsx` with "Application Window" selector (1, 3, 7, 14, 30 days or no deadline)
- Updated `ShiftSearch.tsx` to filter out shifts with expired deadlines

### 6. ✅ forwardRef Fix
- Wrapped `LanguageSwitcher` with `React.forwardRef` to eliminate console warnings

### 7. ✅ i18n Cleanup
- Merged duplicate `chat` and `notifications` keys in both `en.json` and `ar.json`
- All translations now consolidated in single objects

## Files Changed
- `vercel.json` - Simplified SPA config
- `src/components/dashboard/DashboardHeader.tsx` - Logo, notifications, clickable avatar
- `src/pages/Auth.tsx` - ES6 logo import
- `src/components/layout/LanguageSwitcher.tsx` - forwardRef wrapper
- `src/components/chat/ChatList.tsx` - User filtering
- `src/components/chat/ChatContainer.tsx` - Pass profileId prop
- `src/components/clinic/CreateShiftModal.tsx` - Proposal duration field
- `src/pages/shifts/ShiftSearch.tsx` - Filter by proposal deadline
- `src/i18n/locales/en.json` - Merged duplicate keys
- `src/i18n/locales/ar.json` - Merged duplicate keys

## Files Deleted
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `src/stories/` (entire folder)

## Packages Removed
- @storybook/addon-a11y
- @storybook/addon-essentials
- @storybook/addon-interactions
- @storybook/addon-onboarding
- @storybook/addon-themes
- @storybook/react
- @storybook/react-vite
- @storybook/test
- storybook
- @chromatic-com/storybook
