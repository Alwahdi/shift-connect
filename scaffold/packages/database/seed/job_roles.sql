-- ============================================================================
-- SyndeoCare — Seed: Job Roles (Yemen Healthcare Context)
-- ============================================================================

INSERT INTO public.job_roles (name, name_ar, description, display_order) VALUES
  ('Physician', 'طبيب', 'Licensed medical doctor', 1),
  ('Dentist', 'طبيب أسنان', 'Licensed dental practitioner', 2),
  ('Pharmacist', 'صيدلاني', 'Licensed pharmacist', 3),
  ('Nurse', 'ممرض/ة', 'Registered nurse', 4),
  ('Midwife', 'قابلة', 'Licensed midwife', 5),
  ('Lab Technician', 'فني مختبر', 'Medical laboratory technician', 6),
  ('Radiology Technician', 'فني أشعة', 'Radiology and imaging technician', 7),
  ('Physiotherapist', 'أخصائي علاج طبيعي', 'Licensed physiotherapist', 8),
  ('Anesthesia Technician', 'فني تخدير', 'Anesthesia technician', 9),
  ('Medical Assistant', 'مساعد طبي', 'General medical assistant', 10)
ON CONFLICT DO NOTHING;
