-- Migration 1: Add chat media columns to messages table
ALTER TABLE messages ADD COLUMN file_url TEXT DEFAULT NULL;
ALTER TABLE messages ADD COLUMN file_type VARCHAR(50) DEFAULT NULL;
ALTER TABLE messages ADD COLUMN file_name TEXT DEFAULT NULL;
ALTER TABLE messages ADD COLUMN file_size INTEGER DEFAULT NULL;

-- Migration 2: Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'system',
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_in_app BOOLEAN DEFAULT TRUE,
  email_new_jobs BOOLEAN DEFAULT TRUE,
  email_new_messages BOOLEAN DEFAULT TRUE,
  email_booking_updates BOOLEAN DEFAULT TRUE,
  email_digest VARCHAR(20) DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Migration 3: Create chat-media storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for chat media uploads
CREATE POLICY "Authenticated users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- RLS policy for viewing chat media
CREATE POLICY "Authenticated users can view chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- RLS policy for deleting own chat media
CREATE POLICY "Users can delete own chat media"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- Enable realtime for user_preferences
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;