-- =====================================================
-- CHAT SYSTEM TABLES
-- =====================================================

-- Conversations table (between professional and clinic)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(professional_id, clinic_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('professional', 'clinic')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking_request', 'booking_accepted', 'booking_declined', 'booking_cancelled', 'new_message', 'shift_reminder', 'verification_update', 'rating_received', 'shift_filled')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR CONVERSATIONS
-- =====================================================

-- Users can view their own conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
);

-- Users can create conversations they're part of
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
);

-- Users can update their own conversations
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
);

-- =====================================================
-- RLS POLICIES FOR MESSAGES
-- =====================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
        )
    )
);

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
        )
    )
);

-- Users can update messages (mark as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (
            EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
        )
    )
);

-- =====================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (via service role or triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- =====================================================
-- FUNCTION: Check for shift time conflicts
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_shift_overlap(
    p_professional_id UUID,
    p_shift_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_shift_date DATE;
    v_start_time TIME;
    v_end_time TIME;
    v_has_conflict BOOLEAN;
BEGIN
    -- Get the target shift details
    SELECT shift_date, start_time, end_time
    INTO v_shift_date, v_start_time, v_end_time
    FROM shifts
    WHERE id = p_shift_id;
    
    -- Check if professional has any overlapping bookings
    SELECT EXISTS (
        SELECT 1
        FROM bookings b
        JOIN shifts s ON b.shift_id = s.id
        WHERE b.professional_id = p_professional_id
        AND b.status IN ('requested', 'accepted', 'confirmed', 'checked_in')
        AND s.shift_date = v_shift_date
        AND (
            (s.start_time < v_end_time AND s.end_time > v_start_time)
        )
    ) INTO v_has_conflict;
    
    RETURN v_has_conflict;
END;
$$;

-- =====================================================
-- TRIGGER: Prevent overlapping shift applications
-- =====================================================

CREATE OR REPLACE FUNCTION public.prevent_overlapping_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF check_shift_overlap(NEW.professional_id, NEW.shift_id) THEN
        RAISE EXCEPTION 'You already have a booking during this time slot';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_booking_overlap
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_overlapping_bookings();

-- =====================================================
-- FUNCTION: Create notification
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- =====================================================
-- TRIGGER: Auto-notify on booking status change
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_professional_user_id UUID;
    v_clinic_user_id UUID;
    v_shift_title TEXT;
    v_clinic_name TEXT;
    v_professional_name TEXT;
BEGIN
    -- Get user IDs
    SELECT user_id INTO v_professional_user_id FROM profiles WHERE id = NEW.professional_id;
    SELECT user_id, name INTO v_clinic_user_id, v_clinic_name FROM clinics WHERE id = NEW.clinic_id;
    SELECT full_name INTO v_professional_name FROM profiles WHERE id = NEW.professional_id;
    SELECT title INTO v_shift_title FROM shifts WHERE id = NEW.shift_id;
    
    -- Handle new booking request
    IF TG_OP = 'INSERT' THEN
        -- Notify clinic of new application
        PERFORM create_notification(
            v_clinic_user_id,
            'booking_request',
            'New Shift Application',
            v_professional_name || ' applied for ' || v_shift_title,
            jsonb_build_object('booking_id', NEW.id, 'shift_id', NEW.shift_id)
        );
    END IF;
    
    -- Handle status changes
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'accepted' THEN
                PERFORM create_notification(
                    v_professional_user_id,
                    'booking_accepted',
                    'Application Accepted!',
                    v_clinic_name || ' accepted your application for ' || v_shift_title,
                    jsonb_build_object('booking_id', NEW.id, 'shift_id', NEW.shift_id)
                );
            WHEN 'declined' THEN
                PERFORM create_notification(
                    v_professional_user_id,
                    'booking_declined',
                    'Application Declined',
                    v_clinic_name || ' declined your application for ' || v_shift_title,
                    jsonb_build_object('booking_id', NEW.id, 'shift_id', NEW.shift_id)
                );
            WHEN 'cancelled' THEN
                -- Notify the other party
                IF NEW.cancellation_reason IS NOT NULL THEN
                    PERFORM create_notification(
                        v_clinic_user_id,
                        'booking_cancelled',
                        'Booking Cancelled',
                        v_professional_name || ' cancelled the booking for ' || v_shift_title,
                        jsonb_build_object('booking_id', NEW.id, 'reason', NEW.cancellation_reason)
                    );
                END IF;
            ELSE
                NULL;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER booking_notification_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_change();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);