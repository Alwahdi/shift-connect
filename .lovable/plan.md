
# Comprehensive Bug Fix & Feature Implementation Plan

## Issues Identified

### 1. Navigation Inconsistency Between Dashboard and Messages
**Problem**: When navigating from Dashboard to Messages, the navigation bar changes. This is happening because while both pages are under `DashboardLayout`, the `DashboardHeader` component doesn't use the correct SyndeoCare logo - it uses an icon with "SyndeoCare.ai" text, whereas the `Header` component on public pages uses the actual logo image.

**Root Cause**: 
- `DashboardHeader.tsx` (lines 54-61) uses a small icon + text "SyndeoCare.ai" instead of the actual logo image
- The dashboard pages share `DashboardLayout`, but the header appearance differs from the main site

**Solution**: Update `DashboardHeader.tsx` to use the actual SyndeoCare logo image (imported from assets) instead of the icon + text approach, matching the landing page header style.

---

### 2. Auth Page Logo Loading Slowly
**Problem**: The logo on the Auth page is loading slowly.

**Root Cause**: The Auth page (line 320) uses `/syndeocare-logo-white.png` from the public folder directly as a URL string. This doesn't benefit from Vite's asset hashing and preloading.

**Solution**: Import the white logo from assets using ES6 import (similar to how Header.tsx imports `syndeocare-logo.png`), which allows Vite to optimize and potentially preload the asset:
```typescript
import synceoCarlogoWhite from "@/assets/syndeocare-logo-white.png";
```

---

### 3. Storybook Deployment Errors
**Problem**: Storybook is causing deployment errors and needs to be removed or skipped in production.

**Current State**:
- `vercel.json` has a build command that includes Storybook build
- Storybook packages are in regular dependencies (not devDependencies)
- There are version conflicts between Storybook v10 addons and v8 core packages

**Solution**: Remove Storybook from production build:
1. Update `vercel.json` to use simple `npm run build` command (remove Storybook build)
2. Remove Storybook rewrites from vercel.json
3. Move Storybook packages to devDependencies or remove completely if not needed
4. Delete `.storybook/` folder and `src/stories/` folder

---

### 4. Shift Posting Expiration Feature Missing
**Problem**: When posting a shift, clinics cannot set how many days it will be shown before closing for proposals.

**Current State**: The `shifts` table doesn't have an `expires_at` or `proposal_deadline` column.

**Solution**:
1. **Database**: Add `proposal_deadline` column (timestamp) to shifts table via migration
2. **UI**: Update `CreateShiftModal.tsx` to add a "Proposal Duration" field (dropdown: 1, 3, 7, 14, 30 days)
3. **Logic**: Calculate `proposal_deadline = shift_date - X days` or `created_at + X days`
4. **Query**: Update `ShiftSearch.tsx` to filter out shifts where `proposal_deadline < now()`

---

### 5. ChatList Not Filtering by User
**Problem**: The `ChatList` component fetches ALL conversations without filtering by the current user's profile ID, meaning users might see conversations they're not part of.

**Root Cause**: In `ChatList.tsx` lines 54-62, the query doesn't filter by `professional_id` or `clinic_id`.

**Solution**: Add filter to the conversations query:
```typescript
if (userType === "professional") {
  query = query.eq("professional_id", profileId);
} else {
  query = query.eq("clinic_id", profileId);
}
```
Note: This requires passing `profileId` prop to `ChatList` from `ChatContainer`.

---

### 6. Duplicate i18n Keys
**Problem**: The `en.json` file has duplicate `chat` and `notifications` keys:
- `chat` at lines 2-16 AND lines 804-817
- `notifications` at lines 722-740 AND lines 818-823

**Impact**: Only the last definition is used, causing translation inconsistencies (e.g., first `chat` block has "typing" key, second doesn't).

**Solution**: Merge duplicate keys into single comprehensive objects by combining all unique keys.

---

### 7. forwardRef Console Warnings
**Problem**: Console shows "Function components cannot be given refs" warnings for:
- `LanguageSwitcher` component (inside `Header`)

**Root Cause**: When `framer-motion` wraps components, it may attempt to pass refs. The `LanguageSwitcher` is a function component that doesn't use `forwardRef`.

**Solution**: Wrap `LanguageSwitcher` with `React.forwardRef`:
```typescript
const LanguageSwitcher = React.forwardRef<HTMLButtonElement | HTMLDivElement, LanguageSwitcherProps>(
  ({ variant = "full", className = "" }, ref) => { ... }
);
LanguageSwitcher.displayName = "LanguageSwitcher";
```

---

### 8. DashboardHeader Missing NotificationCenter
**Problem**: The `DashboardHeader` uses a static bell button (lines 66-73) instead of the functional `NotificationCenter` component.

**Solution**: Replace static bell button with `<NotificationCenter />` component.

---

### 9. Avatar in DashboardHeader Not Clickable
**Problem**: The avatar in `DashboardHeader` doesn't navigate to profile settings when clicked.

**Solution**: Wrap avatar with `Link` component to appropriate profile route:
```typescript
<Link to={type === "clinic" ? "/profile/clinic" : "/profile/professional"}>
  <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
    ...
  </Avatar>
</Link>
```

---

## Technical Implementation

### Files to Delete
| Path | Reason |
|------|--------|
| `.storybook/` folder | Remove Storybook configuration |
| `src/stories/` folder | Remove Storybook stories |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardHeader.tsx` | Use actual logo image, add NotificationCenter, make avatar clickable |
| `src/pages/Auth.tsx` | Import white logo from assets instead of public URL |
| `src/components/layout/LanguageSwitcher.tsx` | Wrap with forwardRef |
| `src/components/chat/ChatList.tsx` | Add profileId prop and filter conversations |
| `src/components/chat/ChatContainer.tsx` | Pass profileId to ChatList |
| `src/components/clinic/CreateShiftModal.tsx` | Add proposal duration/expiration field |
| `src/i18n/locales/en.json` | Merge duplicate chat and notifications keys |
| `src/i18n/locales/ar.json` | Apply same i18n fixes |
| `vercel.json` | Remove Storybook build and rewrites |
| `package.json` | Remove or move Storybook dependencies |

### Database Migration
Add `proposal_deadline` column to shifts table:
```sql
ALTER TABLE shifts
ADD COLUMN proposal_deadline timestamp with time zone DEFAULT NULL;

-- Create trigger to auto-close shifts when deadline passes
CREATE OR REPLACE FUNCTION check_shift_proposal_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_deadline IS NOT NULL AND NEW.proposal_deadline < NOW() THEN
    NEW.is_filled := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Implementation Order

1. **Storybook Removal** - Remove deployment blockers first
2. **Navigation Fixes** - DashboardHeader logo, NotificationCenter, clickable avatar
3. **Auth Page Logo** - Import optimization for faster loading
4. **Chat Filtering** - Security fix for conversation visibility
5. **forwardRef Fixes** - Clean up console warnings
6. **i18n Cleanup** - Merge duplicate translation keys
7. **Shift Expiration** - Database migration and UI update

---

## Expected Results

After implementing these fixes:
- Consistent navigation across all authenticated pages with proper SyndeoCare logo
- Auth page logo loads faster with Vite optimization
- No Storybook deployment errors
- Clinics can set proposal deadlines for shifts
- Users only see their own conversations in chat
- Clean console with no ref warnings
- All translations work correctly
- Fully functional notifications in dashboard
- Clickable avatar navigates to profile settings
