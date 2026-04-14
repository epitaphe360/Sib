-- =====================================================
-- SCRIPT RAPIDE: Insérer les partenaires de démo
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- Vérifier d'abord si la table partners existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partners') THEN
    RAISE EXCEPTION 'La table partners n''existe pas! Créez-la d''abord.';
  END IF;
END $$;

-- Supprimer les anciens partenaires de démo (pour éviter les doublons)
DELETE FROM public.partners WHERE company_name IN (
  'Musée Maritime du Maroc',
  'Port Solutions Maroc',
  'Tanger Med Logistics',
  'Royal Maritime Group'
);

-- Insérer les 4 partenaires de démo
-- Colonnes réelles: id, user_id, company_name, partner_type, partnership_level, sector, description, logo_url, website, verified, created_at, updated_at
INSERT INTO public.partners (company_name, partner_type, partnership_level, sector, description, logo_url, website, created_at, updated_at)
VALUES
-- 🏛️ Partenaire Musée
(
  'Musée Maritime du Maroc',
  'cultural',
  'museum',
  'Culture & Patrimoine',
  'Musée national dédié à l''histoire maritime du Maroc, présentant des collections uniques d''instruments de navigation et de maquettes de navires.',
  'https://placehold.co/200x200/1e40af/ffffff?text=MMM',
  'https://musee-maritime.ma',
  NOW(),
  NOW()
),
-- 🥈 Partenaire Silver
(
  'Port Solutions Maroc',
  'services',
  'silver',
  'Logistique & Manutention',
  'Leader marocain des solutions portuaires innovantes, spécialisé dans l''optimisation des opérations de manutention.',
  'https://placehold.co/200x200/6b7280/ffffff?text=PSM',
  'https://portsolutions.ma',
  NOW(),
  NOW()
),
-- 🥇 Partenaire Gold
(
  'Tanger Med Logistics',
  'corporate',
  'gold',
  'Logistique & Transport',
  'Partenaire logistique premium du port de Tanger Med, offrant des services de stockage et de distribution internationaux.',
  'https://placehold.co/200x200/f59e0b/ffffff?text=TML',
  'https://tangermedlogistics.ma',
  NOW(),
  NOW()
),
-- 💎 Partenaire Platinium
(
  'Royal Maritime Group',
  'corporate',
  'platinium',
  'Transport Maritime',
  'Groupe maritime d''excellence, sponsor principal de SIB 2026. Leader dans le transport maritime et les services portuaires en Afrique.',
  'https://placehold.co/200x200/8b5cf6/ffffff?text=RMG',
  'https://royalmaritime.ma',
  NOW(),
  NOW()
);

-- =====================================================
-- VÉRIFICATION: Afficher les partenaires insérés
-- =====================================================
SELECT
  CASE partnership_level
    WHEN 'platinium' THEN '💎'
    WHEN 'gold' THEN '🥇'
    WHEN 'silver' THEN '🥈'
    WHEN 'museum' THEN '🏛️'
  END as icon,
  company_name,
  partnership_level as niveau,
  partner_type as type,
  sector,
  website
FROM public.partners
WHERE company_name IN (
  'Musée Maritime du Maroc',
  'Port Solutions Maroc',
  'Tanger Med Logistics',
  'Royal Maritime Group'
)
ORDER BY
  CASE partnership_level
    WHEN 'platinium' THEN 1
    WHEN 'gold' THEN 2
    WHEN 'silver' THEN 3
    WHEN 'museum' THEN 4
  END;

-- =====================================================
-- RÉSULTAT ATTENDU: 4 partenaires
-- 💎 Royal Maritime Group (Platinium)
-- 🥇 Tanger Med Logistics (Gold)
-- 🥈 Port Solutions Maroc (Silver)
-- 🏛️ Musée Maritime du Maroc (Museum)
-- =====================================================
