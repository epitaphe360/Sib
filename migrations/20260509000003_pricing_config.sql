-- ============================================================================
-- MIGRATION: Table de configuration des prix SIB 2026
-- Date: 2026-05-09
-- Description: Permet à l'admin de configurer dynamiquement les prix
--              d'inscription exposant, partenaire et visiteur VIP
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.pricing_config (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text        NOT NULL CHECK (category IN ('visitor', 'exhibitor', 'partner')),
  level       text        NOT NULL,   -- ex: 'vip', 'basic_9', 'official_sponsor'
  label       text        NOT NULL,
  description text,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  currency    text        NOT NULL DEFAULT 'EUR',
  is_active   boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid        REFERENCES public.users(id) ON DELETE SET NULL,

  CONSTRAINT pricing_config_category_level_key UNIQUE (category, level)
);

CREATE INDEX IF NOT EXISTS idx_pricing_config_category ON public.pricing_config(category);
CREATE INDEX IF NOT EXISTS idx_pricing_config_active   ON public.pricing_config(is_active);

-- RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read pricing"        ON public.pricing_config;
DROP POLICY IF EXISTS "Admins can manage pricing"      ON public.pricing_config;

CREATE POLICY "Public can read pricing" ON public.pricing_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing" ON public.pricing_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ── Données initiales ─────────────────────────────────────────────────────

-- VISITEURS
INSERT INTO public.pricing_config (category, level, label, description, amount, currency, sort_order) VALUES
  ('visitor', 'vip', 'Pass Premium VIP', 'Accès complet au salon — badge VIP nominatif', 700.00, 'EUR', 1)
ON CONFLICT (category, level) DO NOTHING;

-- EXPOSANTS
INSERT INTO public.pricing_config (category, level, label, description, amount, currency, sort_order) VALUES
  ('exhibitor', 'basic_9',      'Stand Basic 9 m²',      'Stand 9 m² — 2 badges — 15 RDV B2B',             5000.00, 'MAD', 1),
  ('exhibitor', 'standard_18',  'Stand Standard 18 m²',  'Stand 18 m² — 4 badges — 25 RDV B2B',           12000.00, 'MAD', 2),
  ('exhibitor', 'premium_36',   'Stand Premium 36 m²',   'Stand 36 m² — 5 badges — 30 RDV B2B',           25000.00, 'MAD', 3),
  ('exhibitor', 'elite_54plus', 'Stand Élite 54 m²+',    'Stand sur mesure — RDV & badges illimités',      50000.00, 'MAD', 4)
ON CONFLICT (category, level) DO NOTHING;

-- PARTENAIRES
INSERT INTO public.pricing_config (category, level, label, description, amount, currency, sort_order) VALUES
  ('partner', 'organizer',          'Organisateurs',        'Organisateur principal — accès et visibilité totale',   0.00, 'MAD', 1),
  ('partner', 'co_organizer',       'Co-organisateurs',     'Co-branding officiel — 1ère ligne supports',            0.00, 'MAD', 2),
  ('partner', 'official_sponsor',   'Sponsor Officiel',     'Visibilité maximale — 500 000 MAD',               500000.00, 'MAD', 3),
  ('partner', 'delegated_organizer','Organisateur Délégué', 'Responsable d''une zone du salon',                      0.00, 'MAD', 4),
  ('partner', 'partner',            'Sponsor Silver',       'Visibilité & communication — 200 000 MAD',        200000.00, 'MAD', 5),
  ('partner', 'press_partner',      'Partenaire Presse',    'Accréditation presse officielle',                       0.00, 'MAD', 6)
ON CONFLICT (category, level) DO NOTHING;

COMMIT;
