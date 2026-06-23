-- Bootstrap: Création du schéma de base minimal
-- Date: 2024-12-01
-- Description: Tables de base nécessaires pour toutes les migrations ultérieures
-- Ce fichier doit être appliqué EN PREMIER (timestamp le plus ancien)

-- =====================================================================
-- FONCTION update_updated_at_column (utilisée par de nombreux triggers)
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================================
-- ENUM user_type
-- =====================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
  END IF;
END $$;

-- =====================================================================
-- TABLE: users
-- Table centrale - doit exister avant toutes les autres migrations
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  role text DEFAULT 'visitor',
  type text DEFAULT 'visitor',
  status text DEFAULT 'active',
  partner_tier text,
  visitor_level text,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  minisite_created boolean DEFAULT false,
  profile jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Index utile pour les premières migrations
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: partners
-- Nécessaire avant 20250202000000_add_partner_translations.sql
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'institutional',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  logo_url text,
  website text,
  country text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  sponsorship_level text NOT NULL DEFAULT 'institutional',
  contributions text[] DEFAULT '{}',
  established_year integer,
  employees text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: payment_requests
-- Nécessaire avant 20250103_payment_validation.sql
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  requested_level text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  validated_by uuid,
  validated_at timestamptz,
  validation_notes text,
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- TABLE: notifications
-- Nécessaire avant 20250103_payment_validation.sql (INSERT notification)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
