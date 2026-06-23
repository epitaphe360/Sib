-- Migration: create partner_profiles table for seed and app usage
-- Created: 2025-12-18

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_partnership_level ON public.partner_profiles(partnership_level);
