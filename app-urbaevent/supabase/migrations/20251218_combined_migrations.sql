-- Combined migrations (2025-12-18)
-- Ce fichier concatène les migrations nécessaires pour appliquer les corrections
-- générées localement. Exécutez dans Supabase SQL Editor en une seule passe.

BEGIN;

-- 1) add_user_status_column
-- Migration: ajouter la colonne `status` à la table `users`
-- Résout les triggers/migrations qui référencent `NEW.status` (erreur 42703)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 2) create_exhibitor_profiles
-- Migration: créer la table `exhibitor_profiles` si elle n'existe pas

CREATE TABLE IF NOT EXISTS public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- 3) create_partner_profiles
-- Migration: create partner_profiles table for seed and app usage

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

-- 4) create_visitor_profiles
-- Migration: create visitor_profiles table for seed and app usage

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

-- 5) add_user_role_type_columns
-- Migration: add missing user columns used by seed_test_data.sql

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS visitor_level text,
  ADD COLUMN IF NOT EXISTS partner_tier text;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);

-- 6) add_users_status_columns (is_active, email_verified, created_at)

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);

-- 7) add_users_name_default
-- Ensure users.name exists, set NULLs to '', make NOT NULL with default

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name text;

UPDATE public.users SET name = '' WHERE name IS NULL;

ALTER TABLE IF EXISTS public.users ALTER COLUMN name SET DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
  ) THEN
    -- Ensure no NULLs remain before applying NOT NULL
    UPDATE public.users SET name = '' WHERE name IS NULL;
    EXECUTE 'ALTER TABLE public.users ALTER COLUMN name SET NOT NULL';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);

COMMIT;

-- Fin du script combiné.
-- Remarques:
-- - Si votre projet Supabase exécute déjà certaines de ces migrations, la plupart
--   des commandes sont idempotentes (`IF NOT EXISTS`) et ne provoqueront pas d'erreur.
-- - Exécutez ensuite `supabase/seed_test_data.sql` si vous souhaitez réinjecter les comptes de test.
