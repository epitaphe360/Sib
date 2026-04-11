-- Migration: create visitor_profiles table for seed and app usage
-- Created: 2025-12-18

CREATE TABLE IF NOT EXISTS public.visitor_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text,
  pass_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_user_id ON public.visitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_pass_type ON public.visitor_profiles(pass_type);
