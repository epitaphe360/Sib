-- Migration: Catalogue Exposants SIB 2026
-- Date: 2026-05-14
-- Système de gestion des fiches catalogue exposant

-- Enum statut
DO $$ BEGIN
  CREATE TYPE catalogue_status AS ENUM ('not_sent', 'invited', 'in_progress', 'completed', 'validated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table principale des fiches catalogue
CREATE TABLE IF NOT EXISTS public.catalogue_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibitor_id uuid REFERENCES public.exhibitors(id) ON DELETE CASCADE,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  status catalogue_status DEFAULT 'not_sent' NOT NULL,
  completion_percent int DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),

  -- Suivi des envois
  contact_email text NOT NULL,
  invited_at timestamptz,
  last_reminder_at timestamptz,
  reminder_count int DEFAULT 0,
  last_phone_contact_at timestamptz,
  phone_contact_note text,

  -- Validation admin
  completed_at timestamptz,
  validated_at timestamptz,
  validated_by uuid REFERENCES auth.users(id),

  -- Champs de la fiche catalogue
  company_name text,
  logo_url text,
  country_flag text,        -- code ISO (MA, FR, DE…)
  stand_number text,
  hall text,

  -- Coordonnées
  address text,
  city text,
  country text,
  phone text,
  phone2 text,
  email text,
  website text,

  -- Représentant
  contact_name text,
  contact_title text,       -- Directeur Général, PDG, DGA…

  -- Description commerciale
  activity_description text,
  brands_represented text,
  products_origin_country text,

  -- Réseaux sociaux
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  twitter_url text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de log des relances
CREATE TABLE IF NOT EXISTS public.catalogue_reminders_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_entry_id uuid REFERENCES public.catalogue_entries(id) ON DELETE CASCADE NOT NULL,
  sent_at timestamptz DEFAULT now() NOT NULL,
  reminder_type text DEFAULT 'initial' CHECK (reminder_type IN ('initial', 'reminder_1', 'reminder_2', 'manual', 'phone')),
  sent_by uuid REFERENCES auth.users(id),
  note text
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_exhibitor ON public.catalogue_entries(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_token ON public.catalogue_entries(token);
CREATE INDEX IF NOT EXISTS idx_catalogue_entries_status ON public.catalogue_entries(status);
CREATE INDEX IF NOT EXISTS idx_catalogue_reminders_entry ON public.catalogue_reminders_log(catalogue_entry_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_catalogue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalogue_entries_updated_at ON public.catalogue_entries;
CREATE TRIGGER catalogue_entries_updated_at
  BEFORE UPDATE ON public.catalogue_entries
  FOR EACH ROW EXECUTE FUNCTION update_catalogue_updated_at();

-- RLS
ALTER TABLE public.catalogue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_reminders_log ENABLE ROW LEVEL SECURITY;

-- Admins : accès total
DROP POLICY IF EXISTS "admin_full_access_catalogue" ON public.catalogue_entries;
CREATE POLICY "admin_full_access_catalogue" ON public.catalogue_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "admin_full_access_reminders" ON public.catalogue_reminders_log;
CREATE POLICY "admin_full_access_reminders" ON public.catalogue_reminders_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Accès public via token (SELECT + UPDATE uniquement)
DROP POLICY IF EXISTS "public_read_by_token" ON public.catalogue_entries;
CREATE POLICY "public_read_by_token" ON public.catalogue_entries
  FOR SELECT USING (true);  -- La vérification du token se fait côté applicatif

DROP POLICY IF EXISTS "public_update_by_token" ON public.catalogue_entries;
CREATE POLICY "public_update_by_token" ON public.catalogue_entries
  FOR UPDATE USING (true);  -- La vérification du token se fait côté applicatif
