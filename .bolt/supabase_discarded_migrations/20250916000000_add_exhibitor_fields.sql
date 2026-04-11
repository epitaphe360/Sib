-- Migration: Add optional exhibitor fields and indexes
-- Idempotent: safe to run multiple times

BEGIN;

-- Add optional fields useful for exhibitor profiles
ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS established_year integer,
  ADD COLUMN IF NOT EXISTS employee_count integer,
  ADD COLUMN IF NOT EXISTS revenue numeric,
  ADD COLUMN IF NOT EXISTS markets text[] DEFAULT '{}';

-- Useful indexes for queries and filters
CREATE INDEX IF NOT EXISTS idx_exhibitors_user_id ON public.exhibitors(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_verified ON public.exhibitors(verified);
CREATE INDEX IF NOT EXISTS idx_exhibitors_featured ON public.exhibitors(featured);
CREATE INDEX IF NOT EXISTS idx_exhibitors_category ON public.exhibitors(category);
CREATE INDEX IF NOT EXISTS idx_exhibitors_contact_info_gin ON public.exhibitors USING GIN(contact_info);

COMMIT;

-- Notes:
--  - Run this migration in Supabase SQL editor or via your migration runner.
--  - If you want different defaults/types (e.g., markets as jsonb), edit before running.
