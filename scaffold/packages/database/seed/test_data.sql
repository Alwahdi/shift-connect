-- ============================================================================
-- SyndeoCare — Seed: Test Data (Development Only)
-- ============================================================================
-- WARNING: This file is for local development only.
-- NEVER run this in production.
-- ============================================================================

-- Note: Test users must be created through Supabase Auth first.
-- After creating auth users, run these inserts with their UUIDs.

-- Example (replace UUIDs with actual auth user IDs):

-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'professional'),
--   ('00000000-0000-0000-0000-000000000002', 'clinic'),
--   ('00000000-0000-0000-0000-000000000003', 'admin'),
--   ('00000000-0000-0000-0000-000000000004', 'super_admin');

-- INSERT INTO public.profiles (user_id, full_name, email, phone, specialties, hourly_rate, onboarding_completed, verification_status) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Dr. Ahmed Al-Sanani', 'ahmed@example.com', '+967771234567', ARRAY['General Medicine', 'Emergency'], 5000, true, 'verified');

-- INSERT INTO public.clinics (user_id, name, email, phone, address, onboarding_completed, verification_status) VALUES
--   ('00000000-0000-0000-0000-000000000002', 'Al-Thawra Hospital', 'info@thawra.ye', '+967771234568', 'Al-Thawra District, Sanaa', true, 'verified');
