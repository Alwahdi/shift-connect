-- ============================================================================
-- SyndeoCare — Seed: Certifications
-- ============================================================================

INSERT INTO public.certifications (name, name_ar, abbreviation, description, display_order) VALUES
  ('Basic Life Support', 'الإنعاش القلبي الرئوي الأساسي', 'BLS', 'Basic cardiac life support certification', 1),
  ('Advanced Cardiac Life Support', 'الإنعاش القلبي المتقدم', 'ACLS', 'Advanced cardiac life support', 2),
  ('Pediatric Advanced Life Support', 'إنعاش الأطفال المتقدم', 'PALS', 'Pediatric advanced life support', 3),
  ('Infection Control', 'مكافحة العدوى', 'IC', 'Infection prevention and control certification', 4),
  ('Neonatal Resuscitation', 'إنعاش حديثي الولادة', 'NRP', 'Neonatal resuscitation program', 5),
  ('Emergency Medical Technician', 'فني طوارئ طبية', 'EMT', 'Emergency medical technician certification', 6),
  ('Occupational Health & Safety', 'الصحة والسلامة المهنية', 'OHS', 'Workplace health and safety certification', 7)
ON CONFLICT DO NOTHING;
