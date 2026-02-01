-- Fix the permissive RLS policy for notifications insert
-- Drop and recreate with proper check

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Only authenticated users or the system (via triggers) can insert notifications
CREATE POLICY "Authenticated users can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);