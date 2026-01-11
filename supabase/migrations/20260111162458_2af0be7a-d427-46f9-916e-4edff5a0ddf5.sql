-- Create admin_permissions table for granular admin permissions
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  can_verify_professionals BOOLEAN DEFAULT true,
  can_verify_clinics BOOLEAN DEFAULT true,
  can_verify_documents BOOLEAN DEFAULT true,
  can_manage_admins BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions
FOR ALL
USING (is_super_admin(auth.uid()));

-- Admins can view their own permissions
CREATE POLICY "Admins can view their own permissions"
ON public.admin_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create admin_notes table for notes on users
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('professional', 'clinic')),
  admin_id UUID NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'warning', 'verification', 'follow_up')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
ON public.admin_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Admins can insert notes
CREATE POLICY "Admins can insert notes"
ON public.admin_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Only super admins can delete notes
CREATE POLICY "Super admins can delete notes"
ON public.admin_notes
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Create trigger for updated_at on admin_permissions
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();