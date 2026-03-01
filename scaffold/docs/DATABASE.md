# SyndeoCare — Database Schema

## Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  auth.   │     │ profiles │     │  clinics │
│  users   │────▶│          │     │          │
│          │     │• full_name│     │• name    │
│          │     │• email   │     │• email   │
│          │     │• phone   │     │• phone   │
│          │     │• avatar  │     │• logo    │
│          │     │• location│     │• location│
│          │     │• rating  │     │• rating  │
└──────────┘     └─────┬────┘     └────┬─────┘
                       │               │
                       │    ┌──────────┤
                       │    │          │
                  ┌────▼────▼─┐  ┌────▼─────┐
                  │ bookings  │  │  shifts  │
                  │           │  │          │
                  │• status   │  │• title   │
                  │• check_in │  │• date    │
                  │• check_out│  │• rate    │
                  │• rating   │  │• location│
                  └─────┬─────┘  └──────────┘
                        │
                  ┌─────▼─────┐
                  │  ratings  │
                  │           │
                  │• rating   │
                  │• comment  │
                  └───────────┘

┌──────────────┐     ┌──────────────┐
│conversations │────▶│   messages   │
│              │     │              │
│• clinic_id   │     │• content     │
│• prof_id     │     │• sender_id   │
│• booking_id  │     │• file_url    │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  documents   │     │ user_roles   │     │   admin_     │
│              │     │              │     │ permissions  │
│• file_url    │     │• role        │     │• can_verify  │
│• doc_type    │     │• user_id     │     │• can_manage  │
│• status      │     │              │     │• can_view    │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Tables Reference

| Table | Records | RLS | Realtime |
|-------|---------|-----|----------|
| profiles | User profiles | ✅ | ❌ |
| clinics | Clinic profiles | ✅ | ❌ |
| shifts | Job postings | ✅ | ✅ |
| bookings | Shift bookings | ✅ | ✅ |
| shift_invitations | Direct invitations | ✅ | ✅ |
| conversations | Chat threads | ✅ | ❌ |
| messages | Chat messages | ✅ | ✅ |
| documents | Uploaded docs | ✅ | ❌ |
| ratings | Reviews | ✅ | ❌ |
| notifications | In-app notifs | ✅ | ✅ |
| availability | Schedule | ✅ | ❌ |
| user_roles | Role assignments | ✅ | ❌ |
| admin_permissions | Admin access | ✅ | ❌ |
| admin_notes | Admin notes | ✅ | ❌ |
| user_preferences | Settings | ✅ | ❌ |
| job_roles | Config | ✅ | ❌ |
| document_types | Config | ✅ | ❌ |
| certifications | Config | ✅ | ❌ |
| email_verification_codes | OTP | ✅ | ❌ |

## Database Functions

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check if user has a specific role |
| `is_super_admin(user_id)` | Check super admin status |
| `find_shifts_within_distance(lat, lng, km)` | Geospatial shift search |
| `check_shift_overlap(prof_id, shift_id)` | Prevent double-booking |
| `create_notification(...)` | Create in-app notification |
| `cleanup_expired_verification_codes()` | OTP cleanup |
