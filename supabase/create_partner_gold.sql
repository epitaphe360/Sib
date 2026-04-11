-- Création rapide du compte partner-gold@test.siport.com
-- À exécuter dans le SQL Editor de Supabase

-- Active l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprime le compte s'il existe déjà
DELETE FROM public.partner_profiles WHERE user_id = '00000000-0000-0000-0000-000000000005';
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000005';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000005';

-- Crée le compte dans auth.users (pour l'authentification)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'partner-gold@test.siport.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Crée le profil dans public.users
INSERT INTO public.users (id, email, name, type, status, partner_tier, profile, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'partner-gold@test.siport.com',
  'Gold Partner Industries',
  'partner',
  'active',
  'gold',
  jsonb_build_object(
    'partner_tier', 'gold',
    'company', 'Gold Partner Industries',
    'level', 'gold'
  ),
  NOW(),
  NOW()
);

-- Crée le profil partenaire détaillé
INSERT INTO public.partner_profiles (
  user_id,
  company_name,
  partnership_type,
  partnership_level,
  sector,
  description,
  website,
  verified,
  contact_info,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Gold Partner Industries',
  'corporate',
  'gold',
  'Port Operations',
  'Premium partnership for port excellence',
  'https://www.goldpartner.com',
  true,
  jsonb_build_object(
    'email', 'partner-gold@test.siport.com',
    'phone', '+212 6 99 88 77 66',
    'address', '111 Gold Street, Casablanca'
  ),
  NOW(),
  NOW()
);

-- Vérification
SELECT 
  'auth.users' as table_name,
  email,
  role,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'partner-gold@test.siport.com'

UNION ALL

SELECT 
  'public.users' as table_name,
  email,
  type as role,
  (status = 'active')::text::boolean as email_confirmed
FROM public.users 
WHERE email = 'partner-gold@test.siport.com';
