-- =====================================================================
-- SCRIPT DE CRÉATION DES COMPTES DE TEST SIB 2026
-- À exécuter dans Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/sql/new
--
-- Ce script crée :
--   1. Les utilisateurs dans auth.users (via pgcrypto bcrypt)
--   2. Les profils dans public.users
--
-- MOT DE PASSE PAR DÉFAUT : Test@123456
-- =====================================================================

-- S'assurer que pgcrypto est activé
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────
-- ÉTAPE 1 : Créer les utilisateurs dans auth.users
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_uid UUID;
  v_emails TEXT[] := ARRAY[
    'visitor-free@test.sib2026.ma',
    'visitor-vip@test.sib2026.ma',
    'exhibitor-9m@test.sib2026.ma',
    'exhibitor-18m@test.sib2026.ma',
    'exhibitor-36m@test.sib2026.ma',
    'exhibitor-54m@test.sib2026.ma',
    'partner-museum@test.sib2026.ma',
    'partner-silver@test.sib2026.ma',
    'partner-gold@test.sib2026.ma',
    'partner-platinum@test.sib2026.ma',
    'admin-test@test.sib2026.ma'
  ];
  v_email TEXT;
BEGIN
  FOREACH v_email IN ARRAY v_emails LOOP
    -- Vérifier si l'utilisateur existe déjà dans auth.users
    SELECT id INTO v_uid FROM auth.users WHERE email = v_email;

    IF v_uid IS NULL THEN
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_uid,
        'authenticated',
        'authenticated',
        v_email,
        crypt('Test@123456', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        NOW(),
        NOW(),
        '', '', '', ''
      );
      RAISE NOTICE 'Créé auth user : %', v_email;
    ELSE
      -- Mettre à jour le mot de passe si déjà existant
      UPDATE auth.users
      SET encrypted_password = crypt('Test@123456', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          updated_at = NOW()
      WHERE id = v_uid;
      RAISE NOTICE 'Mis à jour auth user : %', v_email;
    END IF;
  END LOOP;
END
$$;

-- ─────────────────────────────────────────────────────────────────────
-- ÉTAPE 2 : Créer / mettre à jour les profils dans public.users
-- ─────────────────────────────────────────────────────────────────────

-- Visiteur Gratuit
INSERT INTO public.users (id, email, name, type, visitor_level, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'visitor-free@test.sib2026.ma',
  'Jean Dupont',
  'visitor',
  'free',
  'active',
  true,
  '{"firstName":"Jean","lastName":"Dupont","company":"Tech Solutions","country":"FR"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'visitor-free@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'visitor',
  visitor_level = 'free',
  status = 'active',
  is_active = true,
  name = 'Jean Dupont',
  updated_at = NOW();

-- Visiteur VIP
INSERT INTO public.users (id, email, name, type, visitor_level, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'visitor-vip@test.sib2026.ma',
  'Marie Laurent',
  'visitor',
  'vip',
  'active',
  true,
  '{"firstName":"Marie","lastName":"Laurent","company":"Premium Group","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'visitor-vip@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'visitor',
  visitor_level = 'vip',
  status = 'active',
  is_active = true,
  name = 'Marie Laurent',
  updated_at = NOW();

-- Exposant 9m²
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'exhibitor-9m@test.sib2026.ma',
  'Atlas Build Systems',
  'exhibitor',
  'active',
  true,
  '{"companyName":"Atlas Build Systems","standArea":9,"country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'exhibitor-9m@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'exhibitor',
  status = 'active',
  is_active = true,
  name = 'Atlas Build Systems',
  updated_at = NOW();

-- Exposant 18m²
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'exhibitor-18m@test.sib2026.ma',
  'Beton Tech Solutions',
  'exhibitor',
  'active',
  true,
  '{"companyName":"Beton Tech Solutions","standArea":18,"country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'exhibitor-18m@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'exhibitor',
  status = 'active',
  is_active = true,
  name = 'Beton Tech Solutions',
  updated_at = NOW();

-- Exposant 36m²
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'exhibitor-36m@test.sib2026.ma',
  'Maroc Structure Industrie',
  'exhibitor',
  'active',
  true,
  '{"companyName":"Maroc Structure Industrie","standArea":36,"country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'exhibitor-36m@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'exhibitor',
  status = 'active',
  is_active = true,
  name = 'Maroc Structure Industrie',
  updated_at = NOW();

-- Exposant 54m²
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'exhibitor-54m@test.sib2026.ma',
  'Grand Chantier Expo',
  'exhibitor',
  'active',
  true,
  '{"companyName":"Grand Chantier Expo","standArea":54,"country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'exhibitor-54m@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'exhibitor',
  status = 'active',
  is_active = true,
  name = 'Grand Chantier Expo',
  updated_at = NOW();

-- Partenaire Museum
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'partner-museum@test.sib2026.ma',
  'Fondation Patrimoine Bati',
  'partner',
  'active',
  true,
  '{"companyName":"Fondation Patrimoine Bati","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'partner-museum@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'partner',
  status = 'active',
  is_active = true,
  name = 'Fondation Patrimoine Bati',
  updated_at = NOW();

-- Partenaire Silver
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'partner-silver@test.sib2026.ma',
  'Silver Construction Group',
  'partner',
  'active',
  true,
  '{"companyName":"Silver Construction Group","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'partner-silver@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'partner',
  status = 'active',
  is_active = true,
  name = 'Silver Construction Group',
  updated_at = NOW();

-- Partenaire Gold
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'partner-gold@test.sib2026.ma',
  'Gold Batiment Alliance',
  'partner',
  'active',
  true,
  '{"companyName":"Gold Batiment Alliance","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'partner-gold@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'partner',
  status = 'active',
  is_active = true,
  name = 'Gold Batiment Alliance',
  updated_at = NOW();

-- Partenaire Platinum
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'partner-platinum@test.sib2026.ma',
  'Platinum Build Partners',
  'partner',
  'active',
  true,
  '{"companyName":"Platinum Build Partners","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'partner-platinum@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'partner',
  status = 'active',
  is_active = true,
  name = 'Platinum Build Partners',
  updated_at = NOW();

-- Admin Test
INSERT INTO public.users (id, email, name, type, status, is_active, profile, created_at, updated_at)
SELECT
  au.id,
  'admin-test@test.sib2026.ma',
  'Admin Test SIB',
  'admin',
  'active',
  true,
  '{"firstName":"Admin","lastName":"Test","country":"MA"}'::jsonb,
  NOW(), NOW()
FROM auth.users au
WHERE au.email = 'admin-test@test.sib2026.ma'
ON CONFLICT (id) DO UPDATE SET
  type = 'admin',
  status = 'active',
  is_active = true,
  name = 'Admin Test SIB',
  updated_at = NOW();

-- ─────────────────────────────────────────────────────────────────────
-- VÉRIFICATION FINALE
-- ─────────────────────────────────────────────────────────────────────
SELECT
  au.email,
  au.email_confirmed_at IS NOT NULL AS "auth_confirmé",
  pu.type,
  pu.visitor_level,
  pu.status,
  pu.is_active
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email LIKE '%@test.sib2026.ma'
ORDER BY au.email;
