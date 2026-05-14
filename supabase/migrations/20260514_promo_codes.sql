-- Migration: Codes Promo Visiteurs VIP SIB 2026
-- Date: 2026-05-14

-- Enum type de remise
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  -- Pour percentage: valeur entre 1 et 100 ; pour fixed: montant en MAD
  original_price numeric NOT NULL DEFAULT 700,  -- prix de référence (badge VIP = 700 MAD)
  max_uses int,           -- NULL = illimité
  used_count int DEFAULT 0 NOT NULL,
  expires_at timestamptz,  -- NULL = pas d'expiration
  is_active boolean DEFAULT true NOT NULL,
  target text DEFAULT 'vip' CHECK (target IN ('vip', 'all')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Colonne promo_code_id dans payment_requests (si elle n'existe pas déjà)
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS promo_code_id uuid REFERENCES public.promo_codes(id),
  ADD COLUMN IF NOT EXISTS promo_discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_amount numeric;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_promo_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promo_codes_updated_at ON public.promo_codes;
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_promo_codes_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active, expires_at);

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Admins : accès total
DROP POLICY IF EXISTS "admin_full_access_promo_codes" ON public.promo_codes;
CREATE POLICY "admin_full_access_promo_codes" ON public.promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Lecture publique (pour validation côté formulaire)
DROP POLICY IF EXISTS "public_read_active_promo_codes" ON public.promo_codes;
CREATE POLICY "public_read_active_promo_codes" ON public.promo_codes
  FOR SELECT USING (is_active = true);
