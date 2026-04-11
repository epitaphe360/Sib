-- Fix: Update demo exhibitor accounts with standArea in profile
-- This ensures demo accounts show correct quotas based on stand size

-- Update exhibitor profiles with standArea
UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '54'::jsonb)
WHERE email = 'exhibitor-54m@test.siport.com';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '36'::jsonb)
WHERE email = 'exhibitor-36m@test.siport.com';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '18'::jsonb)
WHERE email = 'exhibitor-18m@test.siport.com';

UPDATE public.users 
SET profile = jsonb_set(profile, '{standArea}', '9'::jsonb)
WHERE email = 'exhibitor-9m@test.siport.com';

-- Verify the updates
SELECT email, profile->>'standArea' as stand_area FROM public.users 
WHERE email LIKE 'exhibitor-%@test.siport.com'
ORDER BY email;
