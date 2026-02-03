-- Phase 1: Create OTP verification codes table
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_email_verification_email_code ON email_verification_codes(email, code);
CREATE INDEX idx_email_verification_expires ON email_verification_codes(expires_at);

-- Enable RLS
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for signup)
CREATE POLICY "Anyone can create verification codes"
ON email_verification_codes FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can read their own verification codes by email
CREATE POLICY "Anyone can verify their own codes"
ON email_verification_codes FOR SELECT
USING (true);

-- Policy: Allow updates to mark as verified
CREATE POLICY "Anyone can update verification codes"
ON email_verification_codes FOR UPDATE
USING (true);

-- Cleanup old codes - create function
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 2: Create job_roles table for admin management
CREATE TABLE job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active job roles"
ON job_roles FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage job roles"
ON job_roles FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())
);

-- Phase 3: Create document_types table for admin management
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  applies_to TEXT DEFAULT 'both', -- 'professional', 'clinic', 'both'
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active document types"
ON document_types FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage document types"
ON document_types FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())
);

-- Phase 4: Create certifications table for admin management
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  abbreviation VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active certifications"
ON certifications FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage certifications"
ON certifications FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())
);

-- Seed initial job roles from existing hardcoded values
INSERT INTO job_roles (name, name_ar, description, display_order) VALUES
  ('Registered Nurse (RN)', 'ممرض مسجل', 'Registered nursing professional', 1),
  ('Licensed Practical Nurse (LPN)', 'ممرض عملي مرخص', 'Licensed practical nurse', 2),
  ('Certified Nursing Assistant (CNA)', 'مساعد تمريض معتمد', 'Certified nursing assistant', 3),
  ('Medical Assistant', 'مساعد طبي', 'Medical assistant professional', 4),
  ('Dental Hygienist', 'أخصائي صحة الأسنان', 'Dental hygienist', 5),
  ('Dental Assistant', 'مساعد طبيب أسنان', 'Dental assistant', 6),
  ('Physical Therapist', 'أخصائي علاج طبيعي', 'Physical therapy professional', 7),
  ('Physical Therapy Assistant', 'مساعد علاج طبيعي', 'Physical therapy assistant', 8),
  ('Occupational Therapist', 'أخصائي علاج وظيفي', 'Occupational therapy professional', 9),
  ('Radiologic Technologist', 'تقني أشعة', 'Radiologic technologist', 10),
  ('Phlebotomist', 'أخصائي سحب دم', 'Blood draw specialist', 11),
  ('Home Health Aide', 'مساعد رعاية منزلية', 'Home health care aide', 12)
ON CONFLICT (name) DO NOTHING;

-- Seed initial document types
INSERT INTO document_types (name, name_ar, description, is_required, applies_to, display_order) VALUES
  ('Government ID', 'بطاقة الهوية الحكومية', 'Government-issued identification', TRUE, 'both', 1),
  ('Professional License', 'رخصة مهنية', 'Professional license or certification', TRUE, 'professional', 2),
  ('Certifications', 'الشهادات', 'Additional professional certifications', FALSE, 'professional', 3),
  ('Business License', 'رخصة تجارية', 'Business registration license', TRUE, 'clinic', 4),
  ('Insurance Certificate', 'شهادة التأمين', 'Liability insurance certificate', TRUE, 'clinic', 5)
ON CONFLICT (name) DO NOTHING;

-- Seed initial certifications
INSERT INTO certifications (name, name_ar, abbreviation, description, display_order) VALUES
  ('Basic Life Support', 'دعم الحياة الأساسي', 'BLS', 'CPR and basic emergency care', 1),
  ('Advanced Cardiac Life Support', 'دعم الحياة القلبي المتقدم', 'ACLS', 'Advanced cardiac emergency care', 2),
  ('Pediatric Advanced Life Support', 'دعم الحياة المتقدم للأطفال', 'PALS', 'Pediatric emergency care', 3),
  ('HIPAA Certified', 'معتمد HIPAA', 'HIPAA', 'Healthcare privacy compliance', 4),
  ('IV Certification', 'شهادة الوريد', 'IV', 'Intravenous therapy certified', 5),
  ('Wound Care Certified', 'شهادة العناية بالجروح', 'WCC', 'Wound care specialist', 6)
ON CONFLICT (name) DO NOTHING;