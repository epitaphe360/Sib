/*
  # Recreate Demo Accounts - Direct SQL Execution
  
  This script creates demo accounts directly using Supabase's PostgreSQL instance.
  It uses crypt() for bcrypt hashing which is compatible with Supabase.
*/

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Delete old demo data
DELETE FROM public.appointments;
DELETE FROM public.time_slots;
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.connections;
DELETE FROM public.exhibitors;
DELETE FROM public.exhibitor_profiles;
DELETE FROM public.partner_profiles;
DELETE FROM public.visitor_profiles;
DELETE FROM public.partners WHERE user_id IN (
  SELECT id FROM public.users WHERE email LIKE '%@test.sib2026.ma' OR email LIKE '%@sib.com'
);
DELETE FROM public.registration_requests;
DELETE FROM public.user_favorites;
DELETE FROM public.daily_quotas WHERE user_id IN (
  SELECT id FROM public.users WHERE email IN (
    'admin.sib@sib.com',
    'exhibitor-54m@test.sib2026.ma',
    'exhibitor-36m@test.sib2026.ma',
    'exhibitor-18m@test.sib2026.ma',
    'exhibitor-9m@test.sib2026.ma',
    'partner-gold@test.sib2026.ma',
    'partner-silver@test.sib2026.ma',
    'partner-platinium@test.sib2026.ma',
    'partner-museum@test.sib2026.ma',
    'partner-porttech@test.sib2026.ma',
    'partner-oceanfreight@test.sib2026.ma',
    'partner-coastal@test.sib2026.ma',
    'visitor-vip@test.sib2026.ma',
    'visitor-premium@test.sib2026.ma',
    'visitor-basic@test.sib2026.ma',
    'visitor-free@test.sib2026.ma'
  )
);
DELETE FROM public.users WHERE email IN (
  'admin.sib@sib.com',
  'exhibitor-54m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-porttech@test.sib2026.ma',
  'partner-oceanfreight@test.sib2026.ma',
  'partner-coastal@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'visitor-premium@test.sib2026.ma',
  'visitor-basic@test.sib2026.ma',
  'visitor-free@test.sib2026.ma'
);

DELETE FROM auth.users WHERE email IN (
  'admin.sib@sib.com',
  'exhibitor-54m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-porttech@test.sib2026.ma',
  'partner-oceanfreight@test.sib2026.ma',
  'partner-coastal@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'visitor-premium@test.sib2026.ma',
  'visitor-basic@test.sib2026.ma',
  'visitor-free@test.sib2026.ma'
);

-- Step 2: Create demo accounts with bcrypt-hashed passwords
-- All accounts use password: Admin123!

-- Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.sib@sib.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.sib@sib.com',
  'Admin SIB',
  'admin',
  'active',
  jsonb_build_object('role', 'administrator'),
  NOW(),
  NOW()
);

-- Exhibitors (54m², 36m², 18m², 9m²)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.sib2026.ma', 'ABB Marine & Ports', 'exhibitor', 'active', jsonb_build_object('sector', 'Technology'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.sib2026.ma', 'Advanced Port Systems', 'exhibitor', 'active', jsonb_build_object('sector', 'Automation'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.sib2026.ma', 'Maritime Equipment Co', 'exhibitor', 'active', jsonb_build_object('sector', 'Equipment'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.sib2026.ma', 'StartUp Port Innovations', 'exhibitor', 'active', jsonb_build_object('sector', 'IoT'), NOW(), NOW());

-- Partners
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.sib2026.ma', 'Gold Partner Industries', 'partner', 'active', jsonb_build_object('level', 'gold'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.sib2026.ma', 'Silver Tech Group', 'partner', 'active', jsonb_build_object('level', 'silver'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.sib2026.ma', 'Platinium Global Corp', 'partner', 'active', jsonb_build_object('level', 'platinium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.sib2026.ma', 'Museum Cultural Center', 'partner', 'active', jsonb_build_object('level', 'museum'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.sib2026.ma', 'PortTech Solutions', 'partner', 'active', jsonb_build_object('level', 'porttech'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.sib2026.ma', 'OceanFreight Logistics', 'partner', 'active', jsonb_build_object('level', 'oceanfreight'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.sib2026.ma', 'Coastal Maritime Services', 'partner', 'active', jsonb_build_object('level', 'coastal'), NOW(), NOW());

-- Visitors
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.sib2026.ma', 'VIP Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'vip'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.sib2026.ma', 'Premium Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'premium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.sib2026.ma', 'Basic Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'basic'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.sib2026.ma', 'Free Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'free'), NOW(), NOW());

-- Step 3: Create exhibitor records (linking users to the exhibitors table)
INSERT INTO public.exhibitors (user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'ABB Marine & Ports', 'port-industry', 'Technology', 'Leader in maritime automation and port technology solutions', NULL, 'https://www.abb.com', true, true, jsonb_build_object('email', 'exhibitor-54m@test.sib2026.ma', 'phone', '+212 6 12 34 56 78', 'address', '123 Tech Street, Casablanca', 'name', 'ABB Sales Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Advanced Port Systems', 'port-operations', 'Automation', 'Cutting-edge automation systems for modern ports', NULL, 'https://www.advancedport.com', true, true, jsonb_build_object('email', 'exhibitor-36m@test.sib2026.ma', 'phone', '+212 6 98 76 54 32', 'address', '456 Port Avenue, Tangier', 'name', 'APS Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Maritime Equipment Co', 'port-industry', 'Equipment', 'Premium maritime equipment supplier', NULL, 'https://www.maritimeequip.com', true, false, jsonb_build_object('email', 'exhibitor-18m@test.sib2026.ma', 'phone', '+212 6 55 44 33 22', 'address', '789 Harbor Blvd, Rabat', 'name', 'Maritime Team'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017', 'StartUp Port Innovations', 'port-operations', 'IoT', 'Innovative IoT solutions for port operations', NULL, 'https://www.portinnovations.startup', false, false, jsonb_build_object('email', 'exhibitor-9m@test.sib2026.ma', 'phone', '+212 6 11 22 33 44', 'address', '321 Innovation Park, Fez', 'name', 'StartUp Team'), NOW(), NOW());

-- Step 4: Create partner records (link to partners table)
INSERT INTO public.partners (user_id, name, type, sponsorship_level, sector, description, logo_url, website, verified, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'Gold Partner Industries', 'corporate', 'gold', 'Port Operations', 'Premium partnership for port excellence', NULL, 'https://www.goldpartner.com', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'Silver Tech Group', 'tech', 'silver', 'Technology', 'Technology partner for digital transformation', NULL, 'https://www.silvertech.com', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'Platinium Global Corp', 'corporate', 'platinium', 'Port Management', 'Global platinum partner', NULL, 'https://www.platinium-global.com', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'Museum Cultural Center', 'cultural', 'museum', 'Culture & Heritage', 'Cultural partnership for heritage', NULL, 'https://www.museum-center.ma', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', 'PortTech Solutions', 'tech', 'gold', 'Technology', 'Port technology innovation partner', NULL, 'https://www.porttech-solutions.com', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', 'OceanFreight Logistics', 'logistics', 'silver', 'Logistics', 'Maritime freight specialist', NULL, 'https://www.oceanfreight.logistics', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', 'Coastal Maritime Services', 'services', 'silver', 'Maritime Services', 'Comprehensive maritime services', NULL, 'https://www.coastal-maritime.com', true, NOW(), NOW());

-- Verify accounts were created
SELECT COUNT(*) as created_accounts FROM auth.users WHERE email LIKE '%@test.sib2026.ma' OR email LIKE '%@sib.com';
SELECT COUNT(*) as exhibitors_count FROM public.exhibitors;
SELECT COUNT(*) as partners_count FROM public.partners;
