-- Script de recréation rapide des comptes AUTH principaux
-- À exécuter dans le SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprime et recrée les comptes auth pour les comptes de test principaux
DELETE FROM auth.users WHERE email IN (
  'admin.siports@siports.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'partner-platinium@test.siport.com',
  'partner-museum@test.siport.com',
  'exhibitor-54m@test.siport.com',
  'exhibitor-36m@test.siport.com',
  'exhibitor-18m@test.siport.com',
  'exhibitor-9m@test.siport.com',
  'visitor-vip@test.siport.com',
  'visitor-premium@test.siport.com',
  'visitor-free@test.siport.com'
);

-- Recrée les comptes auth avec mot de passe Admin123!
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES 
  -- Admin
  ((SELECT id FROM public.users WHERE email = 'admin.siports@siports.com'), '00000000-0000-0000-0000-000000000000', 'admin.siports@siports.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Partners
  ((SELECT id FROM public.users WHERE email = 'partner-gold@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'partner-gold@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-silver@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'partner-silver@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-platinium@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'partner-platinium@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-museum@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'partner-museum@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Exhibitors
  ((SELECT id FROM public.users WHERE email = 'exhibitor-54m@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'exhibitor-54m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-36m@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'exhibitor-36m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-18m@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'exhibitor-18m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-9m@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'exhibitor-9m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Visitors
  ((SELECT id FROM public.users WHERE email = 'visitor-vip@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'visitor-vip@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'visitor-premium@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'visitor-premium@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'visitor-free@test.siport.com'), '00000000-0000-0000-0000-000000000000', 'visitor-free@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '');

-- Vérification
SELECT 
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  role
FROM auth.users 
WHERE email IN (
  'admin.siports@siports.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'exhibitor-54m@test.siport.com',
  'visitor-vip@test.siport.com'
)
ORDER BY email;
