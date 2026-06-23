-- Migration: add users is_active, email_verified, created_at columns used by seed
-- Created: 2025-12-18

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);
