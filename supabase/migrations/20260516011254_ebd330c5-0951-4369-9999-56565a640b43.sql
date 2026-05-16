
CREATE TABLE IF NOT EXISTS public.specialties (
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

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active specialties"
  ON public.specialties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage specialties"
  ON public.specialties FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_specialties_updated_at
  BEFORE UPDATE ON public.specialties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.specialties (name, name_ar, display_order) VALUES
  ('General Medicine', 'الطب العام', 1),
  ('Pediatrics', 'طب الأطفال', 2),
  ('Internal Medicine', 'الطب الباطني', 3),
  ('Cardiology', 'أمراض القلب', 4),
  ('Emergency Medicine', 'طب الطوارئ', 5),
  ('Surgery', 'الجراحة العامة', 6),
  ('Obstetrics & Gynecology', 'النساء والولادة', 7),
  ('Orthopedics', 'جراحة العظام', 8),
  ('Dermatology', 'الأمراض الجلدية', 9),
  ('Ophthalmology', 'طب العيون', 10),
  ('Ear, Nose & Throat', 'الأنف والأذن والحنجرة', 11),
  ('Dentistry', 'طب الأسنان', 12),
  ('Psychiatry', 'الطب النفسي', 13),
  ('Radiology', 'الأشعة', 14),
  ('Anesthesiology', 'التخدير', 15),
  ('Nursing - General', 'تمريض عام', 16),
  ('Nursing - ICU', 'تمريض العناية المركزة', 17),
  ('Nursing - Pediatric', 'تمريض الأطفال', 18),
  ('Midwifery', 'القبالة', 19),
  ('Pharmacy', 'الصيدلة', 20),
  ('Laboratory Sciences', 'علوم المختبرات', 21),
  ('Physiotherapy', 'العلاج الطبيعي', 22),
  ('Nutrition', 'التغذية', 23),
  ('Public Health', 'الصحة العامة', 24)
ON CONFLICT DO NOTHING;
