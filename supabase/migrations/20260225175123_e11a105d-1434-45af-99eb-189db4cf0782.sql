
-- Create shift_invitations table
CREATE TABLE public.shift_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(shift_id, professional_id)
);

-- Enable RLS
ALTER TABLE public.shift_invitations ENABLE ROW LEVEL SECURITY;

-- Clinics can view invitations they sent
CREATE POLICY "Clinics can view their sent invitations"
ON public.shift_invitations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.clinics
  WHERE clinics.id = shift_invitations.clinic_id
  AND clinics.user_id = auth.uid()
));

-- Professionals can view invitations sent to them
CREATE POLICY "Professionals can view their invitations"
ON public.shift_invitations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = shift_invitations.professional_id
  AND profiles.user_id = auth.uid()
));

-- Clinics can insert invitations for their own shifts
CREATE POLICY "Clinics can send invitations"
ON public.shift_invitations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.clinics
  WHERE clinics.id = shift_invitations.clinic_id
  AND clinics.user_id = auth.uid()
) AND EXISTS (
  SELECT 1 FROM public.shifts
  WHERE shifts.id = shift_invitations.shift_id
  AND shifts.clinic_id = shift_invitations.clinic_id
));

-- Professionals can update (accept/decline) invitations sent to them
CREATE POLICY "Professionals can respond to invitations"
ON public.shift_invitations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = shift_invitations.professional_id
  AND profiles.user_id = auth.uid()
));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.shift_invitations;
