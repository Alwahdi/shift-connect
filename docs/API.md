# SyndeoCare — Edge Function API Reference

## Overview

All edge functions are deployed as Supabase Edge Functions (Deno runtime). They are invoked via the Supabase client SDK or direct HTTP requests.

Base URL: `https://<PROJECT_ID>.supabase.co/functions/v1/`

## Functions

### `send-otp-email`

Sends a one-time password to a user's email for verification.

**Method:** POST  
**Auth:** None required (public)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### `verify-otp`

Verifies a one-time password submitted by the user.

**Method:** POST  
**Auth:** None required (public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true
}
```

---

### `send-email-notification`

Sends transactional email notifications (new messages, job alerts, booking updates, document status).

**Method:** POST  
**Auth:** Service role or authenticated user

**Request Body:**
```json
{
  "type": "new_message | new_job | booking_update | document_status",
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "data": {
    "senderName": "Jane Smith",
    "jobTitle": "Registered Nurse - Night Shift",
    "clinicName": "Al Noor Clinic",
    "distance": "3.2 km",
    "hourlyRate": "150",
    "bookingStatus": "confirmed",
    "documentName": "Nursing License",
    "documentStatus": "approved"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "email_id" }
}
```

**Required Secrets:** `RESEND_API_KEY`

---

### `delete-account`

Permanently deletes a user account and all associated data.

**Method:** POST  
**Auth:** Authenticated user (JWT required)

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Required Secrets:** `SUPABASE_SERVICE_ROLE_KEY`

---

## Error Handling

All functions return errors in this format:

```json
{
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `200` — Success
- `400` — Bad request (missing/invalid parameters)
- `401` — Unauthorized (invalid or missing JWT)
- `500` — Internal server error

## CORS

All functions include CORS headers allowing requests from any origin. Preflight `OPTIONS` requests are handled automatically.
