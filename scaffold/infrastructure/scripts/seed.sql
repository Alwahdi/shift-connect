-- ============================================================================
-- SyndeoCare — Database Seed Data
-- ============================================================================
-- Run this after migrations to populate reference data.

-- Job Roles (Yemen healthcare context)
INSERT INTO public.job_roles (name, name_ar, description, display_order, is_active) VALUES
  ('Dentist', 'طبيب أسنان', 'Licensed dental practitioner', 1, true),
  ('Dental Hygienist', 'أخصائي صحة أسنان', 'Dental hygiene specialist', 2, true),
  ('Dental Assistant', 'مساعد طبيب أسنان', 'Dental assistance support', 3, true),
  ('Dental Nurse', 'ممرض أسنان', 'Dental nursing care', 4, true),
  ('Orthodontist', 'أخصائي تقويم أسنان', 'Orthodontic specialist', 5, true),
  ('Oral Surgeon', 'جراح الفم والوجه والفكين', 'Oral and maxillofacial surgeon', 6, true),
  ('Endodontist', 'أخصائي علاج الجذور', 'Root canal specialist', 7, true),
  ('Periodontist', 'أخصائي أمراض اللثة', 'Gum disease specialist', 8, true),
  ('Prosthodontist', 'أخصائي التركيبات', 'Dental prosthetics specialist', 9, true),
  ('Pedodontist', 'أخصائي أسنان الأطفال', 'Pediatric dentistry specialist', 10, true)
ON CONFLICT DO NOTHING;

-- Document Types
INSERT INTO public.document_types (name, name_ar, description, is_required, applies_to, display_order, is_active) VALUES
  ('Professional License', 'رخصة مهنية', 'Valid professional practice license', true, 'professional', 1, true),
  ('National ID', 'البطاقة الشخصية', 'Government-issued national identification', true, 'both', 2, true),
  ('Degree Certificate', 'شهادة التخرج', 'University degree certificate', true, 'professional', 3, true),
  ('CPR Certificate', 'شهادة الإنعاش القلبي', 'Current CPR/BLS certification', false, 'professional', 4, true),
  ('Liability Insurance', 'تأمين المسؤولية المهنية', 'Professional liability insurance document', false, 'professional', 5, true),
  ('Clinic License', 'ترخيص المنشأة الصحية', 'Valid clinic operating license', true, 'clinic', 6, true),
  ('Tax Registration', 'السجل الضريبي', 'Tax registration certificate', false, 'clinic', 7, true)
ON CONFLICT DO NOTHING;

-- Certifications
INSERT INTO public.certifications (name, name_ar, abbreviation, description, display_order, is_active) VALUES
  ('Basic Life Support', 'دعم الحياة الأساسي', 'BLS', 'CPR and basic emergency response', 1, true),
  ('Advanced Cardiac Life Support', 'دعم الحياة القلبي المتقدم', 'ACLS', 'Advanced cardiac emergency protocols', 2, true),
  ('Infection Control', 'مكافحة العدوى', 'IC', 'Infection prevention and control certification', 3, true),
  ('Radiation Safety', 'السلامة الإشعاعية', 'RS', 'Dental radiography safety certification', 4, true),
  ('Pediatric Advanced Life Support', 'دعم حياة الأطفال المتقدم', 'PALS', 'Pediatric emergency protocols', 5, true)
ON CONFLICT DO NOTHING;
