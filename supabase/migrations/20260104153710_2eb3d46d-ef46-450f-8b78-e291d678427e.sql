-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('professional', 'clinic', 'admin');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('requested', 'accepted', 'declined', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show');

-- Create enum for document type
CREATE TYPE public.document_type AS ENUM ('id', 'license', 'certification', 'business_license', 'insurance', 'other');

-- Create user_roles table (security best practice - roles separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table for professionals
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[],
  qualifications TEXT[],
  hourly_rate DECIMAL(10,2),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_address TEXT,
  max_travel_distance_km INTEGER DEFAULT 30,
  verification_status verification_status DEFAULT 'pending',
  is_available BOOLEAN DEFAULT true,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create clinics table
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  description TEXT,
  address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  tax_id TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Create documents table for verification
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create shifts table
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  role_required TEXT NOT NULL,
  description TEXT,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  required_certifications TEXT[],
  location_address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  is_urgent BOOLEAN DEFAULT false,
  is_filled BOOLEAN DEFAULT false,
  max_applicants INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'requested',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shift_id, professional_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create availability table for professionals
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, day_of_week)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clinics policies
CREATE POLICY "Clinics are viewable by everyone"
  ON public.clinics FOR SELECT
  USING (true);

CREATE POLICY "Clinic owners can update their clinic"
  ON public.clinics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clinic"
  ON public.clinics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any document"
  ON public.documents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Shifts policies
CREATE POLICY "Shifts are viewable by everyone"
  ON public.shifts FOR SELECT
  USING (true);

CREATE POLICY "Clinics can insert their own shifts"
  ON public.shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE id = clinic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clinics can update their own shifts"
  ON public.shifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE id = clinic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clinics can delete their own shifts"
  ON public.shifts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE id = clinic_id AND user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = professional_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.clinics WHERE id = clinic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can create booking requests"
  ON public.bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = professional_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Booking participants can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = professional_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.clinics WHERE id = clinic_id AND user_id = auth.uid()
    )
  );

-- Ratings policies
CREATE POLICY "Ratings are viewable by booking participants"
  ON public.ratings FOR SELECT
  USING (
    reviewer_id = auth.uid() OR reviewee_id = auth.uid()
  );

CREATE POLICY "Users can create ratings for their bookings"
  ON public.ratings FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- Availability policies
CREATE POLICY "Availability is viewable by everyone"
  ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their availability"
  ON public.availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX idx_profiles_location ON public.profiles(location_lat, location_lng);
CREATE INDEX idx_clinics_user_id ON public.clinics(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_shifts_clinic_id ON public.shifts(clinic_id);
CREATE INDEX idx_shifts_date ON public.shifts(shift_date);
CREATE INDEX idx_shifts_role ON public.shifts(role_required);
CREATE INDEX idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX idx_bookings_clinic_id ON public.bookings(clinic_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);