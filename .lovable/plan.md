

# Chat UI Overhaul & Media Viewing Enhancement

## Issues Identified

After reviewing all 7 chat components, here are the problems:

1. **Mobile layout**: The `Messages.tsx` page header takes up space unnecessarily on mobile when a conversation is active. The container height `h-[calc(100dvh-10rem)]` doesn't account for the bottom nav properly.

2. **Chat filters placement**: `ChatFilters` renders as a separate row inside the header area but visually conflicts -- it's placed inline with the avatar/name instead of below the header.

3. **Image preview dialog**: Missing `DialogTitle` (accessibility), no pinch-to-zoom, no download button, no swipe between images.

4. **Media gallery** (`ChatMediaGallery`): Never wired into the UI -- there's no button in `ChatMessages` to open it. The component exists but is orphaned.

5. **Video/audio files**: No inline playback. Videos and audio sent as attachments just show as generic file icons with download links.

6. **Message bubbles**: Links in text aren't clickable (rendered as plain text via `whitespace-pre-wrap`).

7. **ChatMediaUpload**: The preview state is confusing -- it shows a preview *while* uploading but the upload has already started, so the cancel button doesn't actually cancel the upload.

---

## Part 1: Mobile Chat Layout Fix

### `src/pages/Messages.tsx`
- Hide the page header (h1 + description) on mobile when a conversation is active
- Pass `selectedConversation` state awareness to conditionally hide header
- Change to: on mobile, when conversation is open, render only the ChatContainer with no padding/margins for true full-screen chat
- Add `pb-20` to account for MobileBottomNav

### `src/components/chat/ChatContainer.tsx`
- Change height to `h-[calc(100dvh-8rem)]` on mobile (accounts for header + bottom nav)
- On desktop keep `md:h-[600px]`
- Remove the redundant "Messages" header inside the chat list panel (it duplicates the page header)

---

## Part 2: ChatMessages Improvements

### Header
- Move `ChatFilters` from inline in header to a collapsible row below the header, triggered by a filter icon button
- Add a button to open the `ChatMediaGallery` (the gallery icon)
- Ensure back button has proper RTL support (flip arrow direction)

### Message Bubbles - Clickable Links
- Parse URLs in message content and render them as `<a>` tags with `target="_blank"`
- Style links with underline and appropriate color for own vs other messages

### Message Bubbles - Date Separators
- Add date separator dividers between messages from different days ("Today", "Yesterday", "Feb 24")

### Image Attachments
- Increase max height from `max-h-48` to `max-h-64` for better viewing
- Add rounded corners and a subtle shadow
- Show image loading skeleton while loading

### Video Attachments
- Detect `video/*` file types and render an inline `<video>` player with controls
- Support mp4, webm, mov
- Show poster frame / thumbnail

### Audio Attachments
- Detect `audio/*` file types and render an inline `<audio>` player
- Custom styled player with play/pause, progress bar, duration

---

## Part 3: Image Preview Enhancement

### `ChatMessages.tsx` - Image Preview Dialog
- Add `DialogTitle` for accessibility (sr-only)
- Add download button in the preview overlay
- Add image counter if multiple images exist ("2 of 5")
- Add left/right navigation arrows to browse through all images in the conversation
- Support pinch-to-zoom on mobile via CSS `touch-action: pinch-zoom` and transform

---

## Part 4: Wire Up ChatMediaGallery

### `ChatMessages.tsx`
- Import `ChatMediaGallery`
- Add a gallery button (grid/image icon) in the chat header
- Pass `conversationId` and control open/close state
- This gives users a centralized view of all shared media, files, and links

---

## Part 5: File Type Icons

### Better File Type Detection
- Show PDF icon for `.pdf` files
- Show Word icon for `.doc/.docx`
- Show Excel icon for `.xls/.xlsx`
- Show generic file icon for others
- Color-code the icons (red for PDF, blue for Word, green for Excel)

---

## Part 6: ChatList Polish

### `src/components/chat/ChatList.tsx`
- Show file attachment indicator in last message preview (camera icon for images, paperclip for files)
- Add online/offline status indicator dot on avatars (green dot)
- Improve empty state with a call-to-action

---

## Implementation Summary

| # | File | Changes |
|---|------|---------|
| 1 | `Messages.tsx` | Hide header on mobile when conversation active, fix padding |
| 2 | `ChatContainer.tsx` | Better mobile height, remove duplicate header |
| 3 | `ChatMessages.tsx` | Clickable links, date separators, video/audio players, gallery button, image navigation, better preview dialog |
| 4 | `ChatFilters.tsx` | Move to collapsible panel triggered from header |
| 5 | `ChatList.tsx` | File indicators in preview, online dots, better empty state |
| 6 | `ChatMediaGallery.tsx` | Wire into ChatMessages header, add video tab |
| 7 | `ChatMediaUpload.tsx` | Add video/audio to accepted file types |

### Files Modified: 7
- `src/pages/Messages.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/ChatMessages.tsx`
- `src/components/chat/ChatFilters.tsx`
- `src/components/chat/ChatList.tsx`
- `src/components/chat/ChatMediaGallery.tsx`
- `src/components/chat/ChatMediaUpload.tsx`

### No Database Changes Required

