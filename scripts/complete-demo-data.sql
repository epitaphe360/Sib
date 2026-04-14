-- =====================================================
-- SCRIPT COMPLET POUR CRÉER TOUTES LES DONNÉES DE DÉMONSTRATION
-- À exécuter dans Supabase SQL Editor
-- Version: 2024-12-24
-- =====================================================

-- =====================================================
-- ÉTAPE 0: Instructions pour créer les comptes Auth
-- =====================================================
-- IMPORTANT: Les utilisateurs doivent d'abord être créés via Supabase Auth Dashboard
--
-- 1. Aller dans Supabase Dashboard > Authentication > Users
-- 2. Cliquer sur "Add user" > "Create new user"
-- 3. Créer chaque compte avec:
--    - Email: voir liste ci-dessous
--    - Password: Test@123456
--    - Auto Confirm User: ✓ (coché)
--
-- COMPTES À CRÉER:
-- ================
-- 👑 ADMIN:
--    admin@sib2026.ma
--
-- 👥 VISITEURS:
--    visitor-free@test.sib2026.ma
--    visitor-vip@test.sib2026.ma
--
-- 🤝 PARTENAIRES:
--    partner-museum@test.sib2026.ma
--    partner-silver@test.sib2026.ma
--    partner-gold@test.sib2026.ma
--    partner-platinium@test.sib2026.ma
--
-- 🏢 EXPOSANTS:
--    exhibitor-9m@test.sib2026.ma
--    exhibitor-18m@test.sib2026.ma
--    exhibitor-36m@test.sib2026.ma
--    exhibitor-54m@test.sib2026.ma
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Mise à jour/création des utilisateurs
-- =====================================================

-- ADMIN
-- IMPORTANT: Le code authStore.ts attend status = 'active' pour autoriser la connexion
UPDATE public.users SET
  name = 'Administrateur SIB',
  role = 'admin',
  type = 'admin',
  status = 'active',
  is_active = true
WHERE email = 'admin@sib2026.ma';

-- VISITEURS
UPDATE public.users SET
  name = 'Visiteur Gratuit Demo',
  role = 'visitor',
  type = 'visitor',
  visitor_level = 'free',
  status = 'active',
  is_active = true
WHERE email = 'visitor-free@test.sib2026.ma';

UPDATE public.users SET
  name = 'Visiteur VIP Premium Demo',
  role = 'visitor',
  type = 'visitor',
  visitor_level = 'premium',
  status = 'active',
  is_active = true
WHERE email = 'visitor-vip@test.sib2026.ma';

-- PARTENAIRES
UPDATE public.users SET
  name = 'Partenaire Musée Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'museum',
  status = 'active',
  is_active = true
WHERE email = 'partner-museum@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Silver Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'silver',
  status = 'active',
  is_active = true
WHERE email = 'partner-silver@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Gold Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'gold',
  status = 'active',
  is_active = true
WHERE email = 'partner-gold@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Platinium Demo',
  role = 'partner',
  type = 'partner',
  partner_tier = 'platinium',
  status = 'active',
  is_active = true
WHERE email = 'partner-platinium@test.sib2026.ma';

-- EXPOSANTS
UPDATE public.users SET
  name = 'Exposant Basic 9m² Demo',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-9m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant Standard 18m² Demo',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-18m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant Premium 36m² Demo',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-36m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant Elite 54m² Demo',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-54m@test.sib2026.ma';

-- =====================================================
-- ÉTAPE 2: Création des profils visiteurs
-- =====================================================

-- Visiteur Gratuit
INSERT INTO public.visitor_profiles (user_id, first_name, last_name, company, position, phone, country, visitor_type, pass_type)
SELECT
  id,
  'Jean',
  'Visiteur',
  'Entreprise Test',
  'Responsable Achats',
  '+33 6 00 00 00 01',
  'France',
  'professional',
  'free'
FROM public.users WHERE email = 'visitor-free@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  country = EXCLUDED.country,
  visitor_type = EXCLUDED.visitor_type,
  pass_type = EXCLUDED.pass_type;

-- Visiteur VIP
INSERT INTO public.visitor_profiles (user_id, first_name, last_name, company, position, phone, country, visitor_type, pass_type)
SELECT
  id,
  'Marie',
  'VIP',
  'Grande Entreprise SA',
  'Directrice Générale',
  '+33 6 00 00 00 02',
  'France',
  'professional',
  'premium'
FROM public.users WHERE email = 'visitor-vip@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  country = EXCLUDED.country,
  visitor_type = EXCLUDED.visitor_type,
  pass_type = EXCLUDED.pass_type;

-- =====================================================
-- ÉTAPE 3: Création des profils partenaires
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
-- ÉTAPE 4: Création des profils exposants
-- =====================================================

-- Exposant 9m² (Basic)
INSERT INTO public.exhibitor_profiles (user_id, company_name, first_name, last_name, email, phone, description, website, country, sector, category, stand_number, stand_area)
SELECT
  id,
  'TechPort Startup',
  'Karim',
  'Basic',
  'exhibitor-9m@test.sib2026.ma',
  '+212 6 00 00 00 01',
  'Startup innovante dans le secteur portuaire, développant des solutions IoT pour la gestion des conteneurs.',
  'https://techport-startup.ma',
  'Maroc',
  'Technology',
  'IoT & Smart Ports',
  'A-101',
  9.0
FROM public.users WHERE email = 'exhibitor-9m@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  sector = EXCLUDED.sector,
  category = EXCLUDED.category,
  stand_number = EXCLUDED.stand_number,
  stand_area = EXCLUDED.stand_area;

-- Exposant 18m² (Standard)
INSERT INTO public.exhibitor_profiles (user_id, company_name, first_name, last_name, email, phone, description, website, country, sector, category, stand_number, stand_area)
SELECT
  id,
  'MarineTech Solutions',
  'Salma',
  'Standard',
  'exhibitor-18m@test.sib2026.ma',
  '+212 6 00 00 00 02',
  'Solutions maritimes complètes pour les opérateurs portuaires. Spécialiste des systèmes de tracking et de gestion de flotte.',
  'https://marinetech.ma',
  'Maroc',
  'Maritime Technology',
  'Fleet Management',
  'B-205',
  18.0
FROM public.users WHERE email = 'exhibitor-18m@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  sector = EXCLUDED.sector,
  category = EXCLUDED.category,
  stand_number = EXCLUDED.stand_number,
  stand_area = EXCLUDED.stand_area;

-- Exposant 36m² (Premium)
INSERT INTO public.exhibitor_profiles (user_id, company_name, first_name, last_name, email, phone, description, website, country, sector, category, stand_number, stand_area)
SELECT
  id,
  'Global Shipping Corp',
  'Omar',
  'Premium',
  'exhibitor-36m@test.sib2026.ma',
  '+212 6 00 00 00 03',
  'Leader mondial du transport maritime, présent sur 5 continents. Offrant des solutions de shipping complètes pour les entreprises.',
  'https://globalshipping.com',
  'France',
  'Shipping',
  'International Freight',
  'C-310',
  36.0
FROM public.users WHERE email = 'exhibitor-36m@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  sector = EXCLUDED.sector,
  category = EXCLUDED.category,
  stand_number = EXCLUDED.stand_number,
  stand_area = EXCLUDED.stand_area;

-- Exposant 54m² (Elite)
INSERT INTO public.exhibitor_profiles (user_id, company_name, first_name, last_name, email, phone, description, website, country, sector, category, stand_number, stand_area)
SELECT
  id,
  'Royal Port Authority',
  'Nadia',
  'Elite',
  'exhibitor-54m@test.sib2026.ma',
  '+212 6 00 00 00 04',
  'Autorité portuaire royale, gestionnaire des plus grands ports du Royaume. Innovation, durabilité et excellence au service du commerce maritime.',
  'https://royalport.ma',
  'Maroc',
  'Port Authority',
  'Port Operations',
  'ELITE-1',
  54.0
FROM public.users WHERE email = 'exhibitor-54m@test.sib2026.ma'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  country = EXCLUDED.country,
  sector = EXCLUDED.sector,
  category = EXCLUDED.category,
  stand_number = EXCLUDED.stand_number,
  stand_area = EXCLUDED.stand_area;

-- =====================================================
-- ÉTAPE 5: Vérification finale
-- =====================================================

-- Afficher tous les utilisateurs de test
SELECT
  u.email,
  u.name,
  u.role,
  u.type,
  u.status,
  u.is_active,
  u.visitor_level,
  u.partner_tier,
  COALESCE(ep.stand_area, 0) as stand_area,
  COALESCE(ep.stand_number, '-') as stand_number,
  COALESCE(pp.partnership_level, '-') as partnership_level,
  COALESCE(vp.pass_type, '-') as pass_type
FROM public.users u
LEFT JOIN public.exhibitor_profiles ep ON ep.user_id = u.id
LEFT JOIN public.partner_profiles pp ON pp.user_id = u.id
LEFT JOIN public.visitor_profiles vp ON vp.user_id = u.id
WHERE u.email LIKE '%test.sib2026.ma'
   OR u.email = 'admin@sib2026.ma'
ORDER BY u.role, u.email;

-- =====================================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- =====================================================
--
-- 👑 Admin:
--    admin@sib2026.ma / Test@123456
--
-- 👥 Visiteurs:
--    visitor-free@test.sib2026.ma / Test@123456 (FREE - 0 RDV B2B)
--    visitor-vip@test.sib2026.ma / Test@123456 (PREMIUM - 10 RDV B2B)
--
-- 🤝 Partenaires:
--    partner-museum@test.sib2026.ma / Test@123456 (🏛️ Musée - 20 RDV)
--    partner-silver@test.sib2026.ma / Test@123456 (🥈 Silver - 50 RDV)
--    partner-gold@test.sib2026.ma / Test@123456 (🥇 Gold - 100 RDV)
--    partner-platinium@test.sib2026.ma / Test@123456 (💎 Platinium - Illimité)
--
-- 🏢 Exposants:
--    exhibitor-9m@test.sib2026.ma / Test@123456 (📦 9m² Basic - 0 RDV B2B)
--    exhibitor-18m@test.sib2026.ma / Test@123456 (🏪 18m² Standard - 15 RDV)
--    exhibitor-36m@test.sib2026.ma / Test@123456 (🏬 36m² Premium - 30 RDV)
--    exhibitor-54m@test.sib2026.ma / Test@123456 (🏛️ 54m² Elite - Illimité)
-- =====================================================
