-- ============================================================================
-- SyndeoCare — Complete Database Schema
-- Migration 0001: Initial Schema
-- ============================================================================
-- This single migration creates the complete database from scratch.
-- Run with: supabase db push
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;

-- ── Custom Types ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('professional', 'clinic', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('requested', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM (
    'medical_license', 'nursing_license', 'pharmacy_license',
    'dentistry_license', 'id_card', 'cv', 'certificate',
    'specialization_certificate', 'health_card', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Utility Functions ───────────────────────────────────────────────────────

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Super admin check
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Notification creator
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Geospatial: find shifts within distance
CREATE OR REPLACE FUNCTION public.find_shifts_within_distance(
  user_lat double precision,
  user_lng double precision,
  max_distance_km double precision DEFAULT 50
)
RETURNS TABLE(shift_id uuid, distance_km double precision) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS shift_id,
    ST_Distance(
      s.location_geo::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000.0 AS distance_km
  FROM public.shifts s
  WHERE s.location_geo IS NOT NULL
    AND s.is_filled = false
    AND ST_DWithin(
      s.location_geo::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      max_distance_km * 1000
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Shift overlap check
CREATE OR REPLACE FUNCTION public.check_shift_overlap(
  p_professional_id uuid,
  p_shift_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_shift RECORD;
BEGIN
  SELECT shift_date, start_time, end_time INTO v_shift
  FROM public.shifts WHERE id = p_shift_id;

  RETURN EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.shifts s ON s.id = b.shift_id
    WHERE b.professional_id = p_professional_id
      AND b.status IN ('confirmed', 'checked_in')
      AND s.shift_date = v_shift.shift_date
      AND s.start_time < v_shift.end_time
      AND s.end_time > v_shift.start_time
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Clean up expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ════════════════════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════════════════════

-- ── User Roles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ── Profiles (Professionals) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  avatar_url text,
  bio text,
  specialties text[],
  qualifications text[],
  hourly_rate numeric,
  location_address text,
  location_lat numeric,
  location_lng numeric,
  location_geo geometry(Point, 4326),
  max_travel_distance_km integer DEFAULT 30,
  verification_status verification_status DEFAULT 'pending',
  is_available boolean DEFAULT true,
  rating_avg numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Clinics ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  logo_url text,
  description text,
  address text,
  tax_id text,
  location_lat numeric,
  location_lng numeric,
  location_geo geometry(Point, 4326),
  verification_status verification_status DEFAULT 'pending',
  rating_avg numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Shifts ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title text NOT NULL,
  role_required text NOT NULL,
  description text,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  hourly_rate numeric NOT NULL,
  location_address text,
  location_lat numeric,
  location_lng numeric,
  location_geo geometry(Point, 4326),
  required_certifications text[],
  is_urgent boolean DEFAULT false,
  is_filled boolean DEFAULT false,
  max_applicants integer DEFAULT 10,
  proposal_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Bookings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'requested',
  notes text,
  check_in_time timestamptz,
  check_out_time timestamptz,
  cancellation_reason text,
  cancellation_fee numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Shift Invitations ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shift_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL,
  professional_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Conversations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL,
  content text NOT NULL,
  file_url text,
  file_type varchar,
  file_name text,
  file_size integer,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Documents ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type document_type NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  expiry_date date,
  status verification_status DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Ratings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Availability ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Admin Permissions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  can_verify_professionals boolean DEFAULT true,
  can_verify_clinics boolean DEFAULT true,
  can_verify_documents boolean DEFAULT true,
  can_manage_admins boolean DEFAULT false,
  can_view_analytics boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Admin Notes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  target_type text NOT NULL,
  admin_id uuid NOT NULL,
  note text NOT NULL,
  note_type text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- ── User Preferences ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  language varchar DEFAULT 'en',
  theme varchar DEFAULT 'system',
  notifications_email boolean DEFAULT true,
  notifications_push boolean DEFAULT true,
  notifications_in_app boolean DEFAULT true,
  email_new_jobs boolean DEFAULT true,
  email_new_messages boolean DEFAULT true,
  email_booking_updates boolean DEFAULT true,
  email_digest varchar DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Configurable Lookup Tables ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  description text,
  applies_to text DEFAULT 'both',
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  abbreviation varchar,
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- ── OTP Verification ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code varchar(6) NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_location_geo ON public.profiles USING GIST(location_geo);
CREATE INDEX IF NOT EXISTS idx_clinics_user_id ON public.clinics(user_id);
CREATE INDEX IF NOT EXISTS idx_clinics_location_geo ON public.clinics USING GIST(location_geo);
CREATE INDEX IF NOT EXISTS idx_shifts_clinic_id ON public.shifts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON public.shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_location_geo ON public.shifts USING GIST(location_geo);
CREATE INDEX IF NOT EXISTS idx_shifts_is_filled ON public.shifts(is_filled) WHERE is_filled = false;
CREATE INDEX IF NOT EXISTS idx_bookings_professional ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic ON public.bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shift ON public.bookings(shift_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_conversations_professional ON public.conversations(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversations_clinic ON public.conversations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON public.email_verification_codes(email);


-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════

-- Enable RLS on ALL tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- ── user_roles policies ─────────────────────────────────────────────────────
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
  ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ── profiles policies ───────────────────────────────────────────────────────
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- ── clinics policies ────────────────────────────────────────────────────────
CREATE POLICY "Clinics are viewable by everyone"
  ON public.clinics FOR SELECT USING (true);

CREATE POLICY "Users can insert their own clinic"
  ON public.clinics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinic owners can update their clinic"
  ON public.clinics FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clinics"
  ON public.clinics FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any clinic"
  ON public.clinics FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- ── shifts policies ─────────────────────────────────────────────────────────
CREATE POLICY "Shifts are viewable by everyone"
  ON public.shifts FOR SELECT USING (true);

CREATE POLICY "Clinics can insert their own shifts"
  ON public.shifts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clinics WHERE clinics.id = shifts.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Clinics can update their own shifts"
  ON public.shifts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clinics WHERE clinics.id = shifts.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Clinics can delete their own shifts"
  ON public.shifts FOR DELETE USING (
    EXISTS (SELECT 1 FROM clinics WHERE clinics.id = shifts.clinic_id AND clinics.user_id = auth.uid())
  );

-- ── bookings policies ───────────────────────────────────────────────────────
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = bookings.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = bookings.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Professionals can create booking requests"
  ON public.bookings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = bookings.professional_id AND profiles.user_id = auth.uid())
  );

CREATE POLICY "Booking participants can update bookings"
  ON public.bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = bookings.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = bookings.clinic_id AND clinics.user_id = auth.uid())
  );

-- ── conversations policies ──────────────────────────────────────────────────
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Users can update their conversations"
  ON public.conversations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their conversations"
  ON public.conversations FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
  );

-- ── messages policies ───────────────────────────────────────────────────────
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON public.messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
      )
    )
  );

-- ── documents policies ──────────────────────────────────────────────────────
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any document"
  ON public.documents FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- ── ratings policies ────────────────────────────────────────────────────────
CREATE POLICY "Ratings are viewable by booking participants"
  ON public.ratings FOR SELECT USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Users can create ratings for their bookings"
  ON public.ratings FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- ── notifications policies ──────────────────────────────────────────────────
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can receive notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ── availability policies ───────────────────────────────────────────────────
CREATE POLICY "Availability is viewable by everyone"
  ON public.availability FOR SELECT USING (true);

CREATE POLICY "Professionals can manage their availability"
  ON public.availability FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = availability.profile_id AND profiles.user_id = auth.uid())
  );

-- ── shift_invitations policies ──────────────────────────────────────────────
CREATE POLICY "Clinics can send invitations"
  ON public.shift_invitations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clinics WHERE clinics.id = shift_invitations.clinic_id AND clinics.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM shifts WHERE shifts.id = shift_invitations.shift_id AND shifts.clinic_id = shift_invitations.clinic_id)
  );

CREATE POLICY "Clinics can view their sent invitations"
  ON public.shift_invitations FOR SELECT USING (
    EXISTS (SELECT 1 FROM clinics WHERE clinics.id = shift_invitations.clinic_id AND clinics.user_id = auth.uid())
  );

CREATE POLICY "Professionals can view their invitations"
  ON public.shift_invitations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = shift_invitations.professional_id AND profiles.user_id = auth.uid())
  );

CREATE POLICY "Professionals can respond to invitations"
  ON public.shift_invitations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = shift_invitations.professional_id AND profiles.user_id = auth.uid())
  );

-- ── admin policies ──────────────────────────────────────────────────────────
CREATE POLICY "Super admins can manage all permissions"
  ON public.admin_permissions FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Admins can view their own permissions"
  ON public.admin_permissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notes"
  ON public.admin_notes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can view all notes"
  ON public.admin_notes FOR SELECT USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete notes"
  ON public.admin_notes FOR DELETE USING (is_super_admin(auth.uid()));

-- ── user_preferences policies ───────────────────────────────────────────────
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- ── lookup table policies ───────────────────────────────────────────────────
CREATE POLICY "Anyone can view active job roles"
  ON public.job_roles FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage job roles"
  ON public.job_roles FOR ALL USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Anyone can view active document types"
  ON public.document_types FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage document types"
  ON public.document_types FOR ALL USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Anyone can view active certifications"
  ON public.certifications FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage certifications"
  ON public.certifications FOR ALL USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- ── email_verification_codes policies ───────────────────────────────────────
CREATE POLICY "Service role can manage verification codes"
  ON public.email_verification_codes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════════════════════
-- REALTIME
-- ════════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;


-- ════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', false)
  ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Document storage policies
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Chat file storage policies
CREATE POLICY "Chat participants can view files"
  ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND auth.uid() IS NOT NULL
  );
