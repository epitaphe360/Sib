-- Script de recréation rapide des comptes AUTH principaux
-- À exécuter dans le SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprime et recrée les comptes auth pour les comptes de test principaux
DELETE FROM auth.users WHERE email IN (
  'admin.sib@sib.com',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'partner-platinium@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'exhibitor-54m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'visitor-premium@test.sib2026.ma',
  'visitor-free@test.sib2026.ma'
);

-- Recrée les comptes auth avec mot de passe Admin123!
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES 
  -- Admin
  ((SELECT id FROM public.users WHERE email = 'admin.sib@sib.com'), '00000000-0000-0000-0000-000000000000', 'admin.sib@sib.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Partners
  ((SELECT id FROM public.users WHERE email = 'partner-gold@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'partner-gold@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-silver@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'partner-silver@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-platinium@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'partner-platinium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'partner-museum@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'partner-museum@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Exhibitors
  ((SELECT id FROM public.users WHERE email = 'exhibitor-54m@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'exhibitor-54m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-36m@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'exhibitor-36m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-18m@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'exhibitor-18m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'exhibitor-9m@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'exhibitor-9m@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  
  -- Visitors
  ((SELECT id FROM public.users WHERE email = 'visitor-vip@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'visitor-vip@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'visitor-premium@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'visitor-premium@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', ''),
  ((SELECT id FROM public.users WHERE email = 'visitor-free@test.sib2026.ma'), '00000000-0000-0000-0000-000000000000', 'visitor-free@test.sib2026.ma', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '');

-- Vérification
SELECT 
  email,
  email_confirmed_at IS NOT NULL as confirmed,
  role
FROM auth.users 
WHERE email IN (
  'admin.sib@sib.com',
  'partner-gold@test.sib2026.ma',
  'partner-silver@test.sib2026.ma',
  'exhibitor-54m@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma'
)
ORDER BY email;
