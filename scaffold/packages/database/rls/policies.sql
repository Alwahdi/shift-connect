-- ============================================================================
-- SyndeoCare — RLS Policy Documentation
-- ============================================================================
-- This file documents the complete RLS policy matrix.
-- Actual policies are defined in migrations/0001_initial_schema.sql
-- ============================================================================

/*
┌─────────────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Table                   │ SELECT   │ INSERT   │ UPDATE   │ DELETE   │
├─────────────────────────┼──────────┼──────────┼──────────┼──────────┤
│ user_roles              │ Own+Admin│ Own      │ ✗        │ ✗        │
│ profiles                │ Public   │ Own      │ Own+Admin│ ✗        │
│ clinics                 │ Public   │ Own      │ Own+Admin│ ✗        │
│ shifts                  │ Public   │ Clinic   │ Clinic   │ Clinic   │
│ bookings                │ Parties  │ Prof     │ Parties  │ ✗        │
│ shift_invitations       │ Parties  │ Clinic   │ Prof     │ ✗        │
│ conversations           │ Members  │ Members  │ Members  │ Members  │
│ messages                │ Members  │ Members  │ Members  │ ✗        │
│ documents               │ Own+Admin│ Own      │ Own+Admin│ ✗        │
│ ratings                 │ Parties  │ Reviewer │ ✗        │ ✗        │
│ notifications           │ Own      │ Own      │ Own      │ Own      │
│ availability            │ Public   │ Prof     │ Prof     │ Prof     │
│ admin_permissions       │ Own+Super│ Super    │ Super    │ Super    │
│ admin_notes             │ Admin    │ Admin    │ ✗        │ Super    │
│ user_preferences        │ Own      │ Own      │ Own      │ Own      │
│ job_roles               │ Public*  │ Admin    │ Admin    │ Admin    │
│ document_types          │ Public*  │ Admin    │ Admin    │ Admin    │
│ certifications          │ Public*  │ Admin    │ Admin    │ Admin    │
│ email_verification_codes│ Service  │ Service  │ Service  │ Service  │
└─────────────────────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
  Own      = auth.uid() matches user_id
  Public   = Anyone (even anonymous)
  Public*  = Only active records
  Parties  = Both sides of the relationship
  Members  = Conversation participants
  Prof     = Professional (via profiles table)
  Clinic   = Clinic owner (via clinics table)
  Admin    = has_role('admin')
  Super    = is_super_admin()
  Service  = service_role only
  ✗        = Not allowed
*/
