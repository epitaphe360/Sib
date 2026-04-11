-- =====================================================
-- SCRIPT RAPIDE: Insérer les partenaires de démo (CORRIGÉ)
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
-- Utiliser 'company_name' à la place de 'name' si c'est la colonne réelle
DELETE FROM public.partners WHERE company_name IN (
  'Musée Maritime du Maroc',
  'Port Solutions Maroc',
  'Tanger Med Logistics',
  'Royal Maritime Group'
);

-- Insérer les 4 partenaires de démo
-- Adaptez les colonnes selon votre structure réelle
INSERT INTO public.partners (id, company_name, partner_type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees)
VALUES
-- 🏛️ Partenaire Musée
(
  gen_random_uuid(),
  'Musée Maritime du Maroc',
  'museum',
  'Institution Culturelle',
  'Musée national dédié à l''histoire maritime du Maroc, présentant des collections uniques d''instruments de navigation et de maquettes de navires.',
  'https://placehold.co/200x200/1e40af/ffffff?text=MMM',
  'https://musee-maritime.ma',
  'Maroc',
  'Culture & Patrimoine',
  true,
  true,
  'museum',
  ARRAY['Exposition permanente', 'Visites guidées', 'Ateliers éducatifs'],
  1985,
  '50-100'
),
-- 🥈 Partenaire Silver
(
  gen_random_uuid(),
  'Port Solutions Maroc',
  'silver',
  'Services Portuaires',
  'Leader marocain des solutions portuaires innovantes, spécialisé dans l''optimisation des opérations de manutention.',
  'https://placehold.co/200x200/6b7280/ffffff?text=PSM',
  'https://portsolutions.ma',
  'Maroc',
  'Logistique & Manutention',
  true,
  false,
  'silver',
  ARRAY['Expertise technique', 'Formation', 'Support opérationnel'],
  2010,
  '100-500'
),
-- 🥇 Partenaire Gold
(
  gen_random_uuid(),
  'Tanger Med Logistics',
  'gold',
  'Logistique Internationale',
  'Partenaire logistique premium du port de Tanger Med, offrant des services de stockage et de distribution internationaux.',
  'https://placehold.co/200x200/f59e0b/ffffff?text=TML',
  'https://tangermedlogistics.ma',
  'Maroc',
  'Logistique & Transport',
  true,
  true,
  'gold',
  ARRAY['Logistique intégrée', 'Stockage premium', 'Distribution internationale', 'Tracking avancé'],
  2007,
  '500-1000'
),
-- 💎 Partenaire Platinium
(
  gen_random_uuid(),
  'Royal Maritime Group',
  'platinium',
  'Groupe Maritime',
  'Groupe maritime d''excellence, sponsor principal de SIPORTS 2026. Leader dans le transport maritime et les services portuaires en Afrique.',
  'https://placehold.co/200x200/8b5cf6/ffffff?text=RMG',
  'https://royalmaritime.ma',
  'Maroc',
  'Transport Maritime',
  true,
  true,
  'platinium',
  ARRAY['Sponsor principal', 'Transport maritime', 'Services VIP', 'Networking exclusif', 'Gala officiel'],
  1995,
  '1000+'
);

-- =====================================================
-- VÉRIFICATION: Afficher les partenaires insérés
-- =====================================================
SELECT
  CASE sponsorship_level
    WHEN 'platinium' THEN '💎'
    WHEN 'gold' THEN '🥇'
    WHEN 'silver' THEN '🥈'
    WHEN 'museum' THEN '🏛️'
  END as icon,
  company_name,
  sponsorship_level as niveau,
  featured as "à la une",
  verified as vérifié,
  country as pays
FROM public.partners
ORDER BY
  CASE sponsorship_level
    WHEN 'platinium' THEN 1
    WHEN 'gold' THEN 2
    WHEN 'silver' THEN 3
    WHEN 'museum' THEN 4
  END;

-- =====================================================
-- RÉSULTAT ATTENDU: 4 partenaires
-- 💎 Royal Maritime Group (Platinium) - featured
-- 🥇 Tanger Med Logistics (Gold) - featured
-- 🥈 Port Solutions Maroc (Silver)
-- 🏛️ Musée Maritime du Maroc (Museum) - featured
-- =====================================================
