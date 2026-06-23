-- Lier les exposants actifs sans user_id à leurs comptes auth
-- Exécuter dans Supabase SQL Editor — adapter email / company_name

-- BatiTech (exemple)
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('exposant@sib.com')
  AND e.company_name ILIKE '%BatiTech%'
  AND e.user_id IS NULL;

-- Afrique Étanchéité
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('afrique.etancheite@sib.com')
  AND e.company_name ILIKE '%Afrique%Étanchéité%'
  AND e.user_id IS NULL;

-- Atlas Build
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('atlas.build@sib.com')
  AND e.company_name ILIKE '%Atlas Build%'
  AND e.user_id IS NULL;

-- SOCOFER
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('socofer@sib.com')
  AND e.company_name ILIKE '%SOCOFER%'
  AND e.user_id IS NULL;

-- Aifeiling
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('aifeiling@sib.com')
  AND e.company_name ILIKE '%Aifeiling%'
  AND e.user_id IS NULL;

-- Gold Batiment Alliance
UPDATE public.exhibitors e
SET user_id = au.id, updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower('gold.batiment@sib.com')
  AND e.company_name ILIKE '%Gold Batiment%'
  AND e.user_id IS NULL;

-- Vérification
SELECT company_name, user_id, stand_number
FROM public.exhibitors
WHERE user_id IS NULL
ORDER BY company_name;
