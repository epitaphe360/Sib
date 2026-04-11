-- Migration: ensure users.name has a sensible default so seed inserts without 'name' succeed
-- Created: 2025-12-18

-- Add column if missing (nullable at first to avoid failures)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name text;

-- Set existing NULL names to empty string
UPDATE public.users SET name = '' WHERE name IS NULL;

-- Set a default so future INSERTs that omit `name` get '' instead of NULL
ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET DEFAULT '';

-- Keep NOT NULL constraint if desired; here we make it NOT NULL to match intended model
ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
