# @syndeocare/storage

File storage utilities for SyndeoCare — built on Supabase Storage.

## Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public | Profile photos |
| `documents` | Private | Identity docs, certificates |
| `clinic-logos` | Public | Clinic logos |
| `chat-media` | Private | Chat attachments |

## Structure

```
storage/
├── src/
│   ├── upload.ts                # Upload utilities
│   ├── download.ts              # Download utilities
│   ├── policies.ts              # RLS policy helpers
│   ├── resize.ts                # Image resizing (client-side)
│   └── types.ts                 # Storage types
└── package.json
```

## Usage

```typescript
import { uploadFile, getPublicUrl } from "@syndeocare/storage";

// Upload avatar
const { url } = await uploadFile({
  bucket: "avatars",
  path: `${userId}/avatar.jpg`,
  file: avatarFile,
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
});

// Get public URL
const publicUrl = getPublicUrl("avatars", `${userId}/avatar.jpg`);
```

## Storage Policies

```sql
-- Avatars: public read, authenticated write (own folder)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Documents: private, own + admin access
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'super_admin')
  )
);
```
