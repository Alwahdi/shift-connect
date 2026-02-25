-- Make chat-media bucket public to fix "bucket not found" error
UPDATE storage.buckets SET public = true WHERE id = 'chat-media';

-- Allow users to delete their own messages in conversations they participate in
CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.professional_id AND profiles.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = c.clinic_id AND clinics.user_id = auth.uid())
    )
  )
  AND sender_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
    UNION
    SELECT id FROM clinics WHERE user_id = auth.uid()
  )
);

-- Allow conversation participants to delete conversations
CREATE POLICY "Users can delete their conversations"
ON public.conversations
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = conversations.professional_id AND profiles.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM clinics WHERE clinics.id = conversations.clinic_id AND clinics.user_id = auth.uid())
);