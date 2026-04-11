-- =====================================================
-- ACTIVER TOUS LES COMPTES DE DÉMONSTRATION
-- À exécuter dans Supabase SQL Editor
-- =====================================================
-- IMPORTANT: Le code authStore.ts attend status = 'active' pour autoriser la connexion
-- (pas 'approved' qui est le statut de validation admin)

-- Activer tous les comptes de test existants
UPDATE public.users
SET
  status = 'active',
  is_active = true
WHERE email IN (
  'admin@siport.com',
  'visitor1@test.com',
  'visitor2@test.com',
  'nathalie.robert1@partner.com',
  'pierre.laurent2@partner.com',
  'visitor-free@test.siport.com',
  'visitor-vip@test.siport.com',
  'partner-museum@test.siport.com',
  'partner-silver@test.siport.com',
  'partner-gold@test.siport.com',
  'partner-platinium@test.siport.com',
  'exhibitor-9m@test.siport.com',
  'exhibitor-18m@test.siport.com',
  'exhibitor-36m@test.siport.com',
  'exhibitor-54m@test.siport.com'
);

-- Vérification : voir tous les comptes et leur statut
SELECT 
  email, 
  name, 
  role, 
  type, 
  status, 
  is_active,
  visitor_level,
  partner_tier
FROM public.users 
WHERE email LIKE '%test%' 
   OR email LIKE '%siport%'
ORDER BY role, email;
