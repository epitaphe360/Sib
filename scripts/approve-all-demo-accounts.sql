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
  'admin@sib2026.ma',
  'visitor1@test.com',
  'visitor2@test.com',
  'nathalie.robert1@partner.com',
  'pierre.laurent2@partner.com',
  'visitor-free@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-gold@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-54m@test.sib2026.ma'
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
   OR email LIKE '%sib%'
ORDER BY role, email;
