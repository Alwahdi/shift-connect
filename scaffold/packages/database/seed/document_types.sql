-- ============================================================================
-- SyndeoCare — Seed: Document Types
-- ============================================================================

INSERT INTO public.document_types (name, name_ar, description, applies_to, is_required, display_order) VALUES
  ('Medical License', 'ترخيص مزاولة المهنة', 'Valid medical practice license', 'professional', true, 1),
  ('National ID', 'البطاقة الشخصية', 'Government-issued identification', 'both', true, 2),
  ('CV / Resume', 'السيرة الذاتية', 'Professional curriculum vitae', 'professional', true, 3),
  ('Specialization Certificate', 'شهادة التخصص', 'Board or specialization certification', 'professional', false, 4),
  ('Health Card', 'البطاقة الصحية', 'Valid health card', 'professional', false, 5),
  ('Commercial Registration', 'السجل التجاري', 'Business registration document', 'clinic', true, 6),
  ('Facility License', 'ترخيص المنشأة', 'Health facility operating license', 'clinic', true, 7),
  ('Tax Registration', 'البطاقة الضريبية', 'Tax identification document', 'clinic', false, 8)
ON CONFLICT DO NOTHING;
