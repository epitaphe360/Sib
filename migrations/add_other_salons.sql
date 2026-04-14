-- ============================================================
-- MIGRATION : Ajout des 4 autres salons + colonnes manquantes
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Ajouter les colonnes manquantes à la table salons
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS code          text,
  ADD COLUMN IF NOT EXISTS edition       text,
  ADD COLUMN IF NOT EXISTS web_url       text,
  ADD COLUMN IF NOT EXISTS primary_color text;

-- Mettre à jour SIB avec ses nouvelles colonnes
UPDATE public.salons
SET
  code          = 'SIB',
  edition       = '20ème édition',
  web_url       = 'https://sib2026.vercel.app',
  primary_color = '#4598D1'
WHERE slug = 'sib' OR name ILIKE '%bâtiment%';

-- 2. Insérer les 4 autres salons (is_active = false, à mettre à jour plus tard)

INSERT INTO public.salons (
  id, name, slug, code, edition,
  location, date_debut, date_fin,
  is_active, is_default, sort_order,
  primary_color, web_url,
  config
)
VALUES

-- SIR — Salon International de l'Immobilier
(
  gen_random_uuid(),
  'Salon International de l''Immobilier (SIR)',
  'sir',
  'SIR',
  '2ème édition',
  'Casablanca',
  '2026-06-01',
  '2026-06-05',
  false,
  false,
  2,
  '#F97316',
  'https://sir2026.vercel.app',
  '{"primary_color": "#F97316"}'::jsonb
),

-- SIP — Salon International de la Promotion
(
  gen_random_uuid(),
  'Salon International de la Promotion (SIP)',
  'sip',
  'SIP',
  '1ère édition',
  'Rabat',
  '2027-03-01',
  '2027-03-05',
  false,
  false,
  3,
  '#7C3AED',
  'https://sip2027.vercel.app',
  '{"primary_color": "#7C3AED"}'::jsonb
),

-- BTP — Salon International du BTP
(
  gen_random_uuid(),
  'Salon International du BTP',
  'btp',
  'BTP',
  '3ème édition',
  'Tanger',
  '2026-09-01',
  '2026-09-05',
  false,
  false,
  4,
  '#DC2626',
  'https://btp2026.vercel.app',
  '{"primary_color": "#DC2626"}'::jsonb
),

-- SIE — Salon International de l'Environnement
(
  gen_random_uuid(),
  'Salon International de l''Environnement (SIE)',
  'sie',
  'SIE',
  '1ère édition',
  'Marrakech',
  '2027-10-01',
  '2027-10-05',
  false,
  false,
  5,
  '#16A34A',
  'https://sie2027.vercel.app',
  '{"primary_color": "#16A34A"}'::jsonb
)

ON CONFLICT (slug) DO NOTHING;

-- Vérification
SELECT id, name, code, edition, slug, is_active, primary_color, web_url
FROM public.salons
ORDER BY sort_order;
