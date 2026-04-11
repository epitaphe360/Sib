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
  name = 'Administrateur SIPORT',
  role = 'admin',
  type = 'admin',
  status = 'active',
  is_active = true
WHERE email = 'admin@siport.com';

-- Vérifier les utilisateurs
SELECT id, email, name, role, type, status, is_active 
FROM public.users 
WHERE email LIKE '%siport%' OR email LIKE '%test%'
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
-- visitor-free@test.siport.com
-- visitor-vip@test.siport.com
-- partner-museum@test.siport.com
-- partner-silver@test.siport.com
-- partner-gold@test.siport.com
-- partner-platinium@test.siport.com
-- exhibitor-9m@test.siport.com
-- exhibitor-18m@test.siport.com
-- exhibitor-36m@test.siport.com
-- exhibitor-54m@test.siport.com
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
WHERE email = 'visitor-free@test.siport.com';

UPDATE public.users SET
  name = 'Visiteur VIP Test',
  role = 'visitor',
  type = 'visitor',
  visitor_level = 'vip',
  status = 'active',
  is_active = true
WHERE email = 'visitor-vip@test.siport.com';

-- Mettre à jour les profils des partenaires
UPDATE public.users SET
  name = 'Partenaire Musée Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'museum',
  status = 'active',
  is_active = true
WHERE email = 'partner-museum@test.siport.com';

UPDATE public.users SET
  name = 'Partenaire Silver Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'silver',
  status = 'active',
  is_active = true
WHERE email = 'partner-silver@test.siport.com';

UPDATE public.users SET
  name = 'Partenaire Gold Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'gold',
  status = 'active',
  is_active = true
WHERE email = 'partner-gold@test.siport.com';

UPDATE public.users SET
  name = 'Partenaire Platinium Test',
  role = 'partner',
  type = 'partner',
  partner_tier = 'platinium',
  status = 'active',
  is_active = true
WHERE email = 'partner-platinium@test.siport.com';

-- Mettre à jour les profils des exposants
UPDATE public.users SET
  name = 'Exposant 9m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-9m@test.siport.com';

UPDATE public.users SET
  name = 'Exposant 18m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-18m@test.siport.com';

UPDATE public.users SET
  name = 'Exposant 36m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-36m@test.siport.com';

UPDATE public.users SET
  name = 'Exposant 54m² Test',
  role = 'exhibitor',
  type = 'exhibitor',
  status = 'active',
  is_active = true
WHERE email = 'exhibitor-54m@test.siport.com';

-- Vérification finale
SELECT email, name, role, type, visitor_level, partner_tier, status, is_active 
FROM public.users 
WHERE email LIKE '%test.siport.com' OR email = 'admin@siport.com'
ORDER BY role, email;
