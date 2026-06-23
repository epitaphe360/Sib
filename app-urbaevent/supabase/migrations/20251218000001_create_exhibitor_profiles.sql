-- Migration: créer la table `exhibitor_profiles` si elle n'existe pas
-- Date: 2025-12-17 (complément)

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

-- Indexes utiles
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- Note: certaines migrations ultérieures ajoutent des colonnes dérivées
-- (ex: `exhibitor_level`). Ce fichier crée la table de base utilisée
-- par les scripts de seed et les fonctions de quota.
