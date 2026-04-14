-- ============================================================
-- CRÉATION COMPTE ADMIN DE TEST
-- Email    : admin@sib.ma
-- Password : J@lil123,
-- À exécuter dans Supabase SQL Editor (une seule fois)
-- ============================================================

DO $$
DECLARE
  new_user_id uuid;
BEGIN

  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@sib.ma';

  -- 1. Créer l'utilisateur dans auth.users seulement s'il n'existe pas
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'admin@sib.ma',
      crypt('J@lil123,', gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin SIB"}',
      NOW(),
      NOW(),
      '', '', '', ''
    );
  END IF;

  -- 2. Créer / mettre à jour le profil dans la table users
  INSERT INTO public.users (
    id,
    email,
    name,
    type,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'admin@sib.ma',
    'Admin SIB',
    'admin',
    'admin',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    type   = 'admin',
    role   = 'admin',
    status = 'active';

END $$;

-- Vérification
SELECT
  u.id,
  u.email,
  u.name,
  u.type,
  u.role,
  u.status
FROM public.users u
WHERE u.email = 'admin@sib.ma';
