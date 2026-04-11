-- Vérification des comptes dans auth.users
-- À exécuter dans le SQL Editor de Supabase pour diagnostiquer le problème

-- 1. Vérifier si les comptes existent dans auth.users
SELECT 
  'AUTH.USERS' as source,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  role,
  created_at
FROM auth.users 
WHERE email IN (
  'admin.siports@siports.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'exhibitor-54m@test.siport.com',
  'visitor-vip@test.siport.com'
)
ORDER BY email;

-- 2. Vérifier si les comptes existent dans public.users mais pas dans auth.users
SELECT 
  'PUBLIC.USERS (NO AUTH)' as source,
  u.email,
  u.type,
  u.status,
  u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email IN (
  'admin.siports@siports.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'exhibitor-54m@test.siport.com',
  'visitor-vip@test.siport.com'
)
AND au.id IS NULL
ORDER BY u.email;

-- 3. Compter les comptes de test
SELECT 
  'Total auth.users' as metric,
  COUNT(*) as count
FROM auth.users 
WHERE email LIKE '%@test.siport.com' OR email LIKE '%@siports.com'

UNION ALL

SELECT 
  'Total public.users' as metric,
  COUNT(*) as count
FROM public.users 
WHERE email LIKE '%@test.siport.com' OR email LIKE '%@siports.com';
