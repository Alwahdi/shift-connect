# @syndeocare/analytics

Analytics, error tracking, and observability for SyndeoCare.

## Recommended Stack

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| **Sentry** | Error tracking & performance | 5K errors/mo |
| **PostHog** | Product analytics & session replay | 1M events/mo |
| **Supabase Analytics** | Database & auth logs | Included |

## Structure

```
analytics/
├── src/
│   ├── providers/
│   │   ├── sentry.ts            # Sentry initialization
│   │   └── posthog.ts           # PostHog initialization
│   ├── hooks/
│   │   ├── useTrack.ts          # Event tracking hook
│   │   └── useIdentify.ts       # User identification
│   ├── events.ts                # Event catalog (typed)
│   └── index.ts                 # Unified analytics API
└── package.json
```

## Event Catalog

```typescript
export const EVENTS = {
  // Auth
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  
  // Shifts
  SHIFT_CREATED: "shift_created",
  SHIFT_APPLIED: "shift_applied",
  SHIFT_BOOKED: "shift_booked",
  
  // Bookings
  BOOKING_CHECK_IN: "booking_check_in",
  BOOKING_CHECK_OUT: "booking_check_out",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_RATED: "booking_rated",
  
  // Chat
  MESSAGE_SENT: "message_sent",
  CONVERSATION_STARTED: "conversation_started",
} as const;
```
