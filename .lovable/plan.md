

# Implementation Plan: Invite System, Chat Mobile UX, Auth Logo Fix

## Overview

Four changes requested: (1) shift invite system for clinics to invite professionals, (2) chat UI mobile optimization, (3) auth page logo fix, (4) email verification improvements.

---

## Part 1: Shift Invite System

### Database Changes

**New table: `shift_invitations`**
```sql
CREATE TABLE shift_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(shift_id, professional_id)
);
```

**RLS Policies:**
- Clinics can INSERT invitations for their own shifts
- Professionals can SELECT invitations sent to them
- Clinics can SELECT invitations they sent
- Professionals can UPDATE (accept/decline) invitations sent to them

**Enable realtime** on `shift_invitations` for instant notification on the professional's dashboard.

### Frontend Changes

**Modified: `src/components/clinic/CreateShiftModal.tsx`**
- After shift creation success, show an optional "Invite Professionals" step
- Add a multi-select search component to find and select professionals by name, specialty, or availability
- Each selected professional gets an invitation row inserted into `shift_invitations`

**New: `src/components/clinic/InviteProfessionalsModal.tsx`**
- Standalone modal that can be opened from the shift manage view
- Search professionals with filters (specialty, availability, rating, verification status)
- Show professional cards with avatar, name, rating, specialties
- "Invite" button per professional; disabled if already invited
- Bulk invite option

**Modified: `src/components/clinic/ShiftManageModal.tsx`**
- Add an "Invited" tab alongside Pending/Accepted/Declined
- Show invited professionals with their response status
- Add "Invite More" button that opens `InviteProfessionalsModal`

**New: `src/components/shifts/ShiftInvitationCard.tsx`**
- Card component showing invitation details for professionals
- Accept/Decline buttons
- Accepting creates a booking with status "requested" and updates invitation status

**Modified: `src/pages/dashboard/ProfessionalDashboard.tsx`**
- Add "Invitations" section showing pending shift invitations
- Each invitation shows shift details + clinic info + accept/decline actions

**Notifications:**
- When a clinic sends an invitation, create a notification for the professional
- When a professional responds, create a notification for the clinic

---

## Part 2: Chat Mobile UX Overhaul

### Problem
The chat container uses a fixed `h-[600px]` height that doesn't fill the mobile screen. The input area and message bubbles aren't optimized for mobile touch interaction.

### Changes

**Modified: `src/components/chat/ChatContainer.tsx`**
- Change `h-[600px]` to `h-[calc(100vh-12rem)] md:h-[600px]` so it fills the mobile viewport
- On mobile when a conversation is selected, make it truly full-screen by using `h-[calc(100dvh-8rem)]` (dynamic viewport height for notched devices)

**Modified: `src/components/chat/ChatMessages.tsx`**
- **Header**: Make the back button always visible on mobile with proper touch target (48px), add a subtle border-bottom shadow
- **Message bubbles**: Increase `max-w-[70%]` to `max-w-[85%]` on mobile for better readability
- **Input area**: Add `safe-area-inset-bottom` padding, increase textarea min-height to 48px, make send button 48x48px with primary color
- **Pending media preview**: Optimize for mobile width

**Modified: `src/components/chat/ChatList.tsx`**
- Increase conversation item touch targets to 56px min-height
- Make avatar 48x48px on mobile
- Improve unread badge visibility

**Modified: `src/pages/Messages.tsx`**
- Remove page header/padding on mobile when a conversation is active (pass through to full-screen chat)
- Use `pb-20 md:pb-0` to account for MobileBottomNav

---

## Part 3: Auth Page Logo Fix

### Problem
The Auth page uses `syndeocare-logo-white.png` which the user says shows a "wrong image." The user wants the same logo as the navbar.

### Changes

**Modified: `src/pages/Auth.tsx`**
- Replace `syndeocare-logo-white.png` import with `syndeocare-logo.png` (the regular logo used in the navbar)
- The `gradient-hero` background is dark, so add a white background pill/container behind the logo, or use CSS `filter: brightness(0) invert(1)` to make it visible on dark backgrounds, or simply wrap it in a light card
- Best approach: use the regular logo `syndeocare-logo.png` and display it at the same size as the navbar (h-10 to h-14)

**Modified: `src/pages/VerifyOTP.tsx`**
- Same fix: replace white logo with regular logo
- Apply consistent logo styling

**Modified: `src/pages/EmailVerification.tsx`**
- Currently uses a `Heart` icon + "SyndeoCare" text instead of the actual logo
- Replace with the actual `syndeocare-logo.png` image matching the navbar

---

## Part 4: Translation Keys

**Modified: `src/i18n/locales/en.json`**
- Add keys for invitations: `shifts.invite`, `shifts.inviteProfessionals`, `shifts.inviteSent`, `shifts.invitationReceived`, `shifts.acceptInvitation`, `shifts.declineInvitation`, `shifts.invitedTab`, `shifts.alreadyInvited`, `shifts.inviteMore`

**Modified: `src/i18n/locales/ar.json`**
- Arabic translations for all new keys

---

## Implementation Summary

| # | Category | File(s) | Change |
|---|----------|---------|--------|
| 1 | Database | Migration | Create `shift_invitations` table + RLS + realtime |
| 2 | Feature | New `InviteProfessionalsModal.tsx` | Search & invite professionals to shifts |
| 3 | Feature | New `ShiftInvitationCard.tsx` | Invitation card for professional dashboard |
| 4 | Feature | Modified `CreateShiftModal.tsx` | Post-creation invite step |
| 5 | Feature | Modified `ShiftManageModal.tsx` | Invited tab + invite more button |
| 6 | Feature | Modified `ProfessionalDashboard.tsx` | Show pending invitations |
| 7 | Mobile UX | Modified `ChatContainer.tsx` | Full-height on mobile |
| 8 | Mobile UX | Modified `ChatMessages.tsx` | Touch-optimized input, bubbles, header |
| 9 | Mobile UX | Modified `ChatList.tsx` | Larger touch targets |
| 10 | Mobile UX | Modified `Messages.tsx` | Full-screen chat on mobile |
| 11 | Logo Fix | Modified `Auth.tsx` | Use navbar logo |
| 12 | Logo Fix | Modified `VerifyOTP.tsx` | Use navbar logo |
| 13 | Logo Fix | Modified `EmailVerification.tsx` | Use navbar logo instead of Heart icon |
| 14 | i18n | Modified `en.json`, `ar.json` | New invitation keys |

### New Files: 3
- `src/components/clinic/InviteProfessionalsModal.tsx`
- `src/components/shifts/ShiftInvitationCard.tsx`
- Database migration for `shift_invitations`

### Modified Files: 11
- `src/components/clinic/CreateShiftModal.tsx`
- `src/components/clinic/ShiftManageModal.tsx`
- `src/pages/dashboard/ProfessionalDashboard.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/ChatMessages.tsx`
- `src/components/chat/ChatList.tsx`
- `src/pages/Messages.tsx`
- `src/pages/Auth.tsx`
- `src/pages/VerifyOTP.tsx`
- `src/pages/EmailVerification.tsx`
- `src/i18n/locales/en.json` & `ar.json`

