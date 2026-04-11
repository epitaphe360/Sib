/*
  # Create Demo Accounts for Testing
  
  This migration creates demo accounts directly in the auth and users tables
  using the standard bcrypt hashing that Supabase uses.
*/

-- Use the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Admin123!';
  v_salt text;
  v_hash text;
  v_record RECORD;
BEGIN
  -- Clean up dependent tables to avoid foreign key violations
  DELETE FROM daily_quotas;
  DELETE FROM user_favorites;
  DELETE FROM products;
  DELETE FROM mini_sites;
  DELETE FROM news_articles;
  DELETE FROM events;
  DELETE FROM appointments;
  DELETE FROM time_slots;
  DELETE FROM messages;
  DELETE FROM conversations;
  DELETE FROM connections;
  DELETE FROM exhibitors;
  DELETE FROM exhibitor_profiles;
  DELETE FROM partner_profiles;
  DELETE FROM visitor_profiles;
  DELETE FROM notifications;
  DELETE FROM registration_requests;
  DELETE FROM partners;

  -- Clean up users
  DELETE FROM public.users;
  DELETE FROM auth.users;

  -- Define the users to create
  FOR v_record IN 
    SELECT * FROM (VALUES 
      ('00000000-0000-0000-0000-000000000001'::uuid, 'admin.siports@siports.com', 'admin', 'Admin SIPORTS'),
      ('00000000-0000-0000-0000-000000000002'::uuid, 'exhibitor-54m@test.siport.com', 'exhibitor', 'ABB Marine & Ports'),
      ('00000000-0000-0000-0000-000000000003'::uuid, 'exhibitor-36m@test.siport.com', 'exhibitor', 'Advanced Port Systems'),
      ('00000000-0000-0000-0000-000000000004'::uuid, 'exhibitor-18m@test.siport.com', 'exhibitor', 'Maritime Equipment Co'),
      ('00000000-0000-0000-0000-000000000017'::uuid, 'exhibitor-9m@test.siport.com', 'exhibitor', 'StartUp Port Innovations'),
      ('00000000-0000-0000-0000-000000000005'::uuid, 'partner-gold@test.siport.com', 'partner', 'Gold Partner Industries'),
      ('00000000-0000-0000-0000-000000000006'::uuid, 'partner-silver@test.siport.com', 'partner', 'Silver Tech Group'),
      ('00000000-0000-0000-0000-000000000011'::uuid, 'partner-platinium@test.siport.com', 'partner', 'Platinium Global Corp'),
      ('00000000-0000-0000-0000-000000000012'::uuid, 'partner-museum@test.siport.com', 'partner', 'Museum Cultural Center'),
      ('00000000-0000-0000-0000-000000000013'::uuid, 'partner-porttech@test.siport.com', 'partner', 'PortTech Solutions'),
      ('00000000-0000-0000-0000-000000000014'::uuid, 'partner-oceanfreight@test.siport.com', 'partner', 'OceanFreight Logistics'),
      ('00000000-0000-0000-0000-000000000015'::uuid, 'partner-coastal@test.siport.com', 'partner', 'Coastal Maritime Services'),
      ('00000000-0000-0000-0000-000000000007'::uuid, 'visitor-vip@test.siport.com', 'visitor', 'VIP Visitor'),
      ('00000000-0000-0000-0000-000000000008'::uuid, 'visitor-premium@test.siport.com', 'visitor', 'Premium Visitor'),
      ('00000000-0000-0000-0000-000000000009'::uuid, 'visitor-basic@test.siport.com', 'visitor', 'Basic Visitor'),
      ('00000000-0000-0000-0000-000000000010'::uuid, 'visitor-free@test.siport.com', 'visitor', 'Free Visitor')
    ) AS t(id, email, type, name)
  LOOP
    v_user_id := v_record.id;
    v_email := v_record.email;

    -- Generate bcrypt hash for the password
    v_hash := crypt(v_password, gen_salt('bf'));

    -- Insert into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (v_user_id, v_email, v_hash, NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password;

    -- Insert into public.users
    INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
    VALUES (
      v_user_id,
      v_email,
      v_record.name,
      v_record.type,
      'active',
      jsonb_build_object('role', v_record.type),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      type = EXCLUDED.type;
  END LOOP;

  RAISE NOTICE 'Demo accounts created successfully!';
END $$;

-- Verify the accounts were created
SELECT COUNT(*) as created_accounts FROM auth.users WHERE email LIKE '%@test.siport.com' OR email LIKE '%@siports.com';
