-- =====================================================================
-- FIX : Logos des partenaires institutionnels
-- Les chemins /logos/xxx.png n'existent pas → remplacé par ui-avatars
-- À exécuter dans Supabase SQL Editor
-- =====================================================================

UPDATE public.partners SET logo_url = 'https://ui-avatars.com/api/?name=AMDIE&background=0A3D62&color=E7D192&size=200&bold=true'
WHERE id = '10000000-0000-0000-0000-000000000002';

UPDATE public.partners SET logo_url = 'https://ui-avatars.com/api/?name=FMC&background=1B4332&color=E7D192&size=200&bold=true'
WHERE id = '10000000-0000-0000-0000-000000000003';

UPDATE public.partners SET logo_url = 'https://ui-avatars.com/api/?name=FNBTP&background=7B2D00&color=E7D192&size=200&bold=true'
WHERE id = '10000000-0000-0000-0000-000000000004';

UPDATE public.partners SET logo_url = 'https://ui-avatars.com/api/?name=LAP&background=1A237E&color=E7D192&size=200&bold=true'
WHERE id = '10000000-0000-0000-0000-000000000005';

UPDATE public.partners SET logo_url = 'https://ui-avatars.com/api/?name=URBACOM&background=4A148C&color=E7D192&size=200&bold=true'
WHERE id = '10000000-0000-0000-0000-000000000006';

-- Vérification
SELECT id, company_name, logo_url FROM public.partners ORDER BY company_name;
