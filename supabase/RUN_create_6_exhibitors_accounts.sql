-- ============================================================
-- Créer Auth + profil + lier les 6 exposants sans user_id
-- Mot de passe commun : Expo123!
-- Exécuter dans Supabase SQL Editor (rôle service)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  rec RECORD;
  v_uid UUID;
  v_pwd TEXT := 'Expo123!';
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('Ciments du Maroc',        'B05', 'ciments@sib.com',        'e1000001-0001-4001-8001-000000000001'::uuid),
      ('Doury Group',             'E15', 'doury@sib.com',          'e1000002-0002-4002-8002-000000000002'::uuid),
      ('Knauf Maroc',             'C18', 'knauf@sib.com',          'e1000003-0003-4003-8003-000000000003'::uuid),
      ('LafargeHolcim Maroc',     'A12', 'lafargeholcim@sib.com',  'e1000004-0004-4004-8004-000000000004'::uuid),
      ('Schneider Electric Maroc','D07', 'schneider@sib.com',      'e1000005-0005-4005-8005-000000000005'::uuid),
      ('STO Maroc',               'A23', 'sto@sib.com',            'e1000006-0006-4006-8006-000000000006'::uuid)
    ) AS t(company_name, stand_number, email, fixed_id)
  LOOP
    SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(rec.email);

    IF v_uid IS NULL THEN
      v_uid := rec.fixed_id;
      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_uid,
        'authenticated', 'authenticated',
        lower(rec.email),
        crypt(v_pwd, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', rec.company_name, 'type', 'exhibitor'),
        '', '', '', ''
      );
      RAISE NOTICE 'Auth créé : %', rec.email;
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(v_pwd, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_uid;
      RAISE NOTICE 'Auth existant : %', rec.email;
    END IF;

    INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
    VALUES (
      v_uid,
      lower(rec.email),
      rec.company_name,
      'exhibitor',
      'active',
      jsonb_build_object('company', rec.company_name, 'standNumber', rec.stand_number),
      now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email   = EXCLUDED.email,
      name    = EXCLUDED.name,
      type    = 'exhibitor',
      status  = 'active',
      profile = COALESCE(public.users.profile, '{}'::jsonb) || EXCLUDED.profile,
      updated_at = now();

    UPDATE public.exhibitors
    SET user_id = v_uid, updated_at = now()
    WHERE company_name = rec.company_name
      AND stand_number = rec.stand_number
      AND user_id IS NULL;

    RAISE NOTICE 'Stand lié : % (stand %)', rec.company_name, rec.stand_number;
  END LOOP;
END;
$$;

-- auth.identities (requis pour connexion email/password sur Supabase récent)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  au.id,
  jsonb_build_object('sub', au.id::text, 'email', au.email, 'email_verified', true),
  'email',
  au.id::text,
  now(), now(), now()
FROM auth.users au
WHERE lower(au.email) IN (
  'ciments@sib.com', 'doury@sib.com', 'knauf@sib.com',
  'lafargeholcim@sib.com', 'schneider@sib.com', 'sto@sib.com'
)
AND NOT EXISTS (
  SELECT 1 FROM auth.identities i
  WHERE i.user_id = au.id AND i.provider = 'email'
);

-- Vérification finale
SELECT e.company_name, e.stand_number, e.user_id, u.email
FROM public.exhibitors e
LEFT JOIN public.users u ON u.id = e.user_id
WHERE e.company_name IN (
  'Ciments du Maroc', 'Doury Group', 'Knauf Maroc',
  'LafargeHolcim Maroc', 'Schneider Electric Maroc', 'STO Maroc'
)
ORDER BY e.company_name;
