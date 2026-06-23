-- Migration: add missing user columns used by seed_test_data.sql
-- Created: 2025-12-18

-- Add simple text columns if they don't exist so seeds can run
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS visitor_level text,
  ADD COLUMN IF NOT EXISTS partner_tier text;

-- Indexes to speed lookups by role/type
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);
