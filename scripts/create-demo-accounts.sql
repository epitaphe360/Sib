-- =====================================================
-- SCRIPT POUR CRÉER LES COMPTES DE DÉMONSTRATION
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- Note: Les utilisateurs doivent d'abord être créés via l'API Auth
-- Ce script crée uniquement les entrées dans public.users

-- Insérer les utilisateurs de test s'ils n'existent pas déjà
-- L'ID doit correspondre à l'ID dans auth.users

-- Pour l'admin existant, mettre à jour son profil
-- IMPORTANT: Le code authStore.ts attend status = 'active' pour autoriser la connexion
UPDATE public.users
SET
  name = 'Administrateur SIB',
  role = 'admin',
  type = 'admin',
  status = 'active',
  is_active = true
WHERE email = 'admin@sib2026.ma';

-- Vérifier les utilisateurs
SELECT id, email, name, role, type, status, is_active 
FROM public.users 
WHERE email LIKE '%sib%' OR email LIKE '%test%'
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- Instructions pour créer les comptes manuellement:
-- =====================================================
-- 1. Aller dans Supabase Dashboard > Authentication > Users
-- 2. Cliquer sur "Add user" > "Create new user"
-- 3. Créer chaque compte avec:
--    - Email: voir liste ci-dessous
--    - Password: Test@123456
--    - Auto Confirm User: ✓ (coché)
-- 
-- COMPTES À CRÉER:
-- ================
-- visitor-free@test.sib2026.ma
-- visitor-vip@test.sib2026.ma
-- partner-museum@test.sib2026.ma
-- partner-silver@test.sib2026.ma
-- partner-gold@test.sib2026.ma
-- partner-platinium@test.sib2026.ma
-- exhibitor-9m@test.sib2026.ma
-- exhibitor-18m@test.sib2026.ma
-- exhibitor-36m@test.sib2026.ma
-- exhibitor-54m@test.sib2026.ma
--
-- Après avoir créé les utilisateurs dans Auth, exécuter ce script
-- pour mettre à jour leurs profils dans public.users
-- =====================================================

-- Mettre à jour les profils des visiteurs
UPDATE public.users SET
  name = 'Visiteur Gratuit Test',
  role = 'visitor',
  type = 'visitor',
  visitor_level = 'free',
  status = 'active',
  is_active = true
WHERE email = 'visitor-free@test.sib2026.ma';

UPDATE public.users SET
  name = 'Visiteur VIP Test',
  role = 'visitor',
  type = 'visitor',
  visitor_level = 'vip',
  status = 'active',
  is_active = true
WHERE email = 'visitor-vip@test.sib2026.ma';

-- Mettre à jour les profils des partenaires
UPDATE public.users SET
  name = 'Partenaire Musée Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'museum',
  status = 'active',
  is_active = true
WHERE email = 'partner-museum@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Silver Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'silver',
  status = 'active',
  is_active = true
WHERE email = 'partner-silver@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Gold Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'gold',
  status = 'active',
  is_active = true
WHERE email = 'partner-gold@test.sib2026.ma';

UPDATE public.users SET
  name = 'Partenaire Platinium Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'platinium',
  status = 'active',
  is_active = true
WHERE email = 'partner-platinium@test.sib2026.ma';

-- Mettre à jour les profils des exposants
UPDATE public.users SET
  name = 'Exposant 9m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-9m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant 18m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-18m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant 36m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-36m@test.sib2026.ma';

UPDATE public.users SET
  name = 'Exposant 54m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-54m@test.sib2026.ma';

-- Vérification finale
SELECT email, name, role, type, visitor_level, partner_tier, status, is_active 
FROM public.users 
WHERE email LIKE '%test.sib2026.ma' OR email = 'admin@sib2026.ma'
ORDER BY role, email;
