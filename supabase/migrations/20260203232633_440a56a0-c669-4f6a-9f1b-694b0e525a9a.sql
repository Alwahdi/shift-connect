-- Fix security issues from linter

-- 1. Fix function search_path for cleanup_expired_verification_codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop overly permissive policies on email_verification_codes and create safer ones
DROP POLICY IF EXISTS "Anyone can create verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can verify their own codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON email_verification_codes;

-- Create service role policies - OTP operations will be done through edge functions with service role
-- This is more secure as it prevents direct client manipulation
CREATE POLICY "Service role can manage verification codes"
ON email_verification_codes FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');