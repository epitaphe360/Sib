-- =====================================================
-- SCRIPT POUR AJOUTER LES COMPTES PARTENAIRES DE DÉMO
-- À exécuter dans Supabase SQL Editor
-- =====================================================
--
-- ÉTAPE 1: Créer les comptes dans Supabase Auth Dashboard
-- =========================================================
-- 1. Aller dans Supabase Dashboard > Authentication > Users
-- 2. Cliquer sur "Add user" > "Create new user"
-- 3. Créer chaque compte avec:
--    - Email: voir liste ci-dessous
--    - Password: Test@123456
--    - Auto Confirm User: ✓ (coché)
--
-- COMPTES PARTENAIRES À CRÉER:
--    partner-museum@test.sib2026.ma    (🏛️ Musée - $20,000)
--    partner-silver@test.sib2026.ma    (🥈 Silver - $48,000)
--    partner-gold@test.sib2026.ma      (🥇 Gold - $68,000)
--    partner-platinium@test.sib2026.ma (💎 Platinium - $98,000)
--
-- ÉTAPE 2: Exécuter ce script SQL
-- =========================================================

-- =====================================================
-- Mise à jour des utilisateurs partenaires
-- =====================================================

-- Partenaire Musée (🏛️)
UPDATE public.users SET
  name = 'Partenaire Musée Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'museum',
  status = 'active',
  is_active = true
WHERE email = 'partner-museum@test.sib2026.ma';

-- Partenaire Silver (🥈)
UPDATE public.users SET
  name = 'Partenaire Silver Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'silver',
  status = 'active',
  is_active = true
WHERE email = 'partner-silver@test.sib2026.ma';

-- Partenaire Gold (🥇)
UPDATE public.users SET
  name = 'Partenaire Gold Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'gold',
  status = 'active',
  is_active = true
WHERE email = 'partner-gold@test.sib2026.ma';

-- Partenaire Platinium (💎)
UPDATE public.users SET
  name = 'Partenaire Platinium Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'platinium',
  status = 'active',
  is_active = true
WHERE email = 'partner-platinium@test.sib2026.ma';

-- =====================================================
-- Création des profils partenaires
-- =====================================================

-- Partenaire Musée
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Musée Maritime du Maroc',
  'Hassan Alami',
  'partner-museum@test.sib2026.ma',
  '+212 5 22 00 00 01',
  'Musée national dédié à l''histoire maritime du Maroc, présentant des collections uniques d''instruments de navigation et de maquettes de navires.',
  'https://musee-maritime.ma',
  'Maroc',
  'museum'
FROM public.users WHERE email = 'partner-museum@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Silver
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Port Solutions Maroc',
  'Fatima Bennani',
  'partner-silver@test.sib2026.ma',
  '+212 5 22 00 00 02',
  'Leader marocain des solutions portuaires innovantes, spécialisé dans l''optimisation des opérations de manutention.',
  'https://portsolutions.ma',
  'Maroc',
  'silver'
FROM public.users WHERE email = 'partner-silver@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Gold
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Tanger Med Logistics',
  'Ahmed El Fassi',
  'partner-gold@test.sib2026.ma',
  '+212 5 39 00 00 03',
  'Partenaire logistique premium du port de Tanger Med, offrant des services de stockage et de distribution internationaux.',
  'https://tangermedlogistics.ma',
  'Maroc',
  'gold'
FROM public.users WHERE email = 'partner-gold@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- Partenaire Platinium
INSERT INTO public.partner_profiles (user_id, company_name, contact_name, contact_email, contact_phone, description, website, country, partnership_level)
SELECT
  id,
  'Royal Maritime Group',
  'Youssef Tazi',
  'partner-platinium@test.sib2026.ma',
  '+212 5 22 00 00 04',
  'Groupe maritime d''excellence, sponsor principal de SIB 2026. Leader dans le transport maritime et les services portuaires en Afrique.',
  'https://royalmaritime.ma',
  'Maroc',
  'platinium'
FROM public.users WHERE email = 'partner-platinium@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- ÉTAPE 3: Ajout des partenaires dans la table partners
-- (pour affichage sur la page d'accueil et page partenaires)
-- =====================================================

-- Partenaire Musée
INSERT INTO public.partners (id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees)
VALUES (
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
)
ON CONFLICT DO NOTHING;

-- Partenaire Silver
INSERT INTO public.partners (id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees)
VALUES (
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
)
ON CONFLICT DO NOTHING;

-- Partenaire Gold
INSERT INTO public.partners (id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees)
VALUES (
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
)
ON CONFLICT DO NOTHING;

-- Partenaire Platinium
INSERT INTO public.partners (id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees)
VALUES (
  gen_random_uuid(),
  'Royal Maritime Group',
  'platinium',
  'Groupe Maritime',
  'Groupe maritime d''excellence, sponsor principal de SIB 2026. Leader dans le transport maritime et les services portuaires en Afrique.',
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
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Vérification
-- =====================================================

-- Vérifier les comptes utilisateurs partenaires
SELECT
  u.email,
  u.name,
  u.role,
  u.type,
  u.partner_tier,
  u.status,
  u.is_active,
  pp.company_name,
  pp.partnership_level
FROM public.users u
LEFT JOIN public.partner_profiles pp ON pp.user_id = u.id
WHERE u.type = 'partner'
ORDER BY u.partner_tier;

-- Vérifier les partenaires dans la table partners (pour affichage public)
SELECT
  id,
  name,
  type,
  sponsorship_level,
  featured,
  verified,
  country
FROM public.partners
ORDER BY
  CASE sponsorship_level
    WHEN 'platinium' THEN 1
    WHEN 'gold' THEN 2
    WHEN 'silver' THEN 3
    WHEN 'museum' THEN 4
  END;

-- =====================================================
-- RÉSUMÉ DES COMPTES PARTENAIRES
-- =====================================================
--
-- 🏛️ Musée ($20,000):
--    Email: partner-museum@test.sib2026.ma
--    Password: Test@123456
--    Quotas: 20 RDV, 5 events, 10 média, 3 team members
--
-- 🥈 Silver ($48,000):
--    Email: partner-silver@test.sib2026.ma
--    Password: Test@123456
--    Quotas: 50 RDV, 10 events, 30 média, 5 team members
--
-- 🥇 Gold ($68,000):
--    Email: partner-gold@test.sib2026.ma
--    Password: Test@123456
--    Quotas: 100 RDV, 20 events, 75 média, 10 team members
--
-- 💎 Platinium ($98,000):
--    Email: partner-platinium@test.sib2026.ma
--    Password: Test@123456
--    Quotas: ILLIMITÉ RDV, events, 200 média, 20 team members
-- =====================================================
