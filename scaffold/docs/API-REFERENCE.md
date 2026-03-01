# SyndeoCare — API Reference

## Edge Functions

Base URL: `https://<project-id>.supabase.co/functions/v1`

### Authentication

All requests require the `Authorization` header:

```
Authorization: Bearer <user-jwt-token>
```

And the `apikey` header:

```
apikey: <supabase-anon-key>
```

---

### POST `/send-otp-email`

Send an OTP verification code to an email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "Ahmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error (429):**
```json
{
  "error": "Too many attempts. Please try again later."
}
```

---

### POST `/verify-otp`

Verify an OTP code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "verified": true
}
```

**Error (400):**
```json
{
  "error": "Invalid or expired code"
}
```

---

### POST `/send-email-notification`

Send a transactional email notification.

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Booking Confirmed",
  "template": "booking-confirmed",
  "data": {
    "shiftTitle": "Dental Assistant",
    "date": "2026-03-15",
    "clinicName": "Al-Amal Dental Clinic"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "messageId": "msg_xxx"
}
```

---

### POST `/delete-account`

Permanently delete a user account and all associated data.

**Request Body:**
```json
{
  "userId": "uuid-here",
  "confirmation": "DELETE"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### GET `/health-check`

Health check endpoint for monitoring.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": true,
    "auth": true,
    "storage": true
  }
}
```

## Supabase Client API

For direct database operations, use the Supabase JS client:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Fetch shifts
const { data, error } = await supabase
  .from("shifts")
  .select("*, clinics(*)")
  .gte("shift_date", new Date().toISOString())
  .order("shift_date", { ascending: true });

// Create booking
const { data, error } = await supabase
  .from("bookings")
  .insert({
    shift_id: shiftId,
    professional_id: profileId,
    clinic_id: clinicId,
    status: "pending",
  });

// Real-time subscription
const channel = supabase
  .channel("messages")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```
