-- =============================================================================
-- SEED : Comptes de test SIB 2026 — tous les types de rôles
-- Exécuter dans Supabase SQL Editor (service_role) ou via `supabase db reset`
-- =============================================================================
-- ⚠️  Ces comptes sont UNIQUEMENT pour les tests. Ne pas déployer en production.
-- Mots de passe en clair ci-dessous — à changer avant mise en production.
-- =============================================================================

-- Extension nécessaire pour chiffrer les mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. Nettoyer les éventuels anciens comptes de test
-- -----------------------------------------------------------------------------
DELETE FROM public.users WHERE email LIKE '%@sib2026.test';
DELETE FROM auth.users   WHERE email LIKE '%@sib2026.test';

-- -----------------------------------------------------------------------------
-- 2. Créer les utilisateurs auth.users
--    (password hash pour chaque compte — connexion par email + mot de passe)
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES
-- ─── ADMIN (organisateur) ───────────────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'authenticated', 'authenticated',
  'admin@sib2026.test',
  crypt('SIB2026admin!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin SIB","type":"admin"}'
),
-- ─── SÉCURITÉ (contrôle des zones) ──────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-0002-0002-0002-000000000002',
  'authenticated', 'authenticated',
  'securite@sib2026.test',
  crypt('SIB2026sec!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Agent Sécurité","type":"security"}'
),
-- ─── SERVICE CLIENTÈLE (accueil / impression badges) ────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'cccccccc-0003-0003-0003-000000000003',
  'authenticated', 'authenticated',
  'accueil@sib2026.test',
  crypt('SIB2026sc!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Agent Accueil","type":"service_client"}'
),
-- ─── 2e POSTE SERVICE CLIENTÈLE (pour tester multi-postes) ─────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'cccccccc-0004-0004-0004-000000000004',
  'authenticated', 'authenticated',
  'accueil2@sib2026.test',
  crypt('SIB2026sc2!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Agent Accueil 2","type":"service_client"}'
),
-- ─── EXPOSANT ────────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'dddddddd-0005-0005-0005-000000000005',
  'authenticated', 'authenticated',
  'exposant@sib2026.test',
  crypt('SIB2026exp!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Exposant Demo","type":"exhibitor"}'
),
-- ─── PARTENAIRE ──────────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'eeeeeeee-0006-0006-0006-000000000006',
  'authenticated', 'authenticated',
  'partenaire@sib2026.test',
  crypt('SIB2026par!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Partenaire Demo","type":"partner"}'
),
-- ─── VISITEUR GRATUIT ────────────────────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'ffffffff-0007-0007-0007-000000000007',
  'authenticated', 'authenticated',
  'visiteur@sib2026.test',
  crypt('SIB2026vis!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Visiteur Gratuit","type":"visitor"}'
),
-- ─── VISITEUR VIP / PREMIUM ──────────────────────────────────────────────────
(
  '00000000-0000-0000-0000-000000000000',
  'ffffffff-0008-0008-0008-000000000008',
  'authenticated', 'authenticated',
  'visiteur.vip@sib2026.test',
  crypt('SIB2026vip!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Visiteur VIP","type":"visitor"}'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Créer les lignes public.users correspondantes
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, email, name, type, visitor_level, status, profile) VALUES

-- Admin
(
  'aaaaaaaa-0001-0001-0001-000000000001',
  'admin@sib2026.test',
  'Admin SIB',
  'admin',
  null,
  'active',
  '{"firstName":"Admin","lastName":"SIB","authMethod":"password","country":"MA","businessSector":"Organisation"}'::jsonb
),

-- Sécurité
(
  'bbbbbbbb-0002-0002-0002-000000000002',
  'securite@sib2026.test',
  'Agent Sécurité',
  'security',
  null,
  'active',
  '{"firstName":"Agent","lastName":"Sécurité","authMethod":"password","country":"MA","businessSector":"Sécurité","zone":"all"}'::jsonb
),

-- Service clientèle 1
(
  'cccccccc-0003-0003-0003-000000000003',
  'accueil@sib2026.test',
  'Agent Accueil',
  'service_client',
  null,
  'active',
  '{"firstName":"Agent","lastName":"Accueil","authMethod":"password","country":"MA","businessSector":"Service Clientèle","deskNumber":1}'::jsonb
),

-- Service clientèle 2
(
  'cccccccc-0004-0004-0004-000000000004',
  'accueil2@sib2026.test',
  'Agent Accueil 2',
  'service_client',
  null,
  'active',
  '{"firstName":"Agent","lastName":"Accueil 2","authMethod":"password","country":"MA","businessSector":"Service Clientèle","deskNumber":2}'::jsonb
),

-- Exposant
(
  'dddddddd-0005-0005-0005-000000000005',
  'exposant@sib2026.test',
  'Exposant Demo',
  'exhibitor',
  null,
  'active',
  '{"firstName":"Exposant","lastName":"Demo","authMethod":"password","country":"MA","businessSector":"Industrie","company":"Demo SARL","position":"Directeur"}'::jsonb
),

-- Partenaire
(
  'eeeeeeee-0006-0006-0006-000000000006',
  'partenaire@sib2026.test',
  'Partenaire Demo',
  'partner',
  null,
  'active',
  '{"firstName":"Partenaire","lastName":"Demo","authMethod":"password","country":"MA","businessSector":"Média","company":"Presse Nationale"}'::jsonb
),

-- Visiteur gratuit
(
  'ffffffff-0007-0007-0007-000000000007',
  'visiteur@sib2026.test',
  'Visiteur Gratuit',
  'visitor',
  'free',
  'active',
  '{"firstName":"Visiteur","lastName":"Gratuit","authMethod":"password","country":"MA","businessSector":"BTP / Construction"}'::jsonb
),

-- Visiteur VIP
(
  'ffffffff-0008-0008-0008-000000000008',
  'visiteur.vip@sib2026.test',
  'Visiteur VIP',
  'visitor',
  'premium',
  'active',
  '{"firstName":"Visiteur","lastName":"VIP","authMethod":"password","country":"MA","businessSector":"Architecture","company":"VIP Corp"}'::jsonb
)

ON CONFLICT (id) DO UPDATE SET
  email        = EXCLUDED.email,
  name         = EXCLUDED.name,
  type         = EXCLUDED.type,
  visitor_level = EXCLUDED.visitor_level,
  status       = EXCLUDED.status,
  profile      = EXCLUDED.profile;

-- -----------------------------------------------------------------------------
-- 4. Lier l'exposant à une entreprise dans la table exhibitors (si elle existe)
-- -----------------------------------------------------------------------------
INSERT INTO public.exhibitors (user_id, company_name, sector, stand_number, hall, is_published)
VALUES (
  'dddddddd-0005-0005-0005-000000000005',
  'Demo SARL',
  'Industrie',
  'A-12',
  'Hall A',
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- RÉCAPITULATIF DES COMPTES DE TEST
-- =============================================================================
-- | Rôle             | Email                     | Mot de passe    | Accès                                    |
-- |------------------|---------------------------|-----------------|------------------------------------------|
-- | admin            | admin@sib2026.test        | SIB2026admin!   | Tout : stats, paiements, utilisateurs   |
-- | security         | securite@sib2026.test     | SIB2026sec!     | Scanner QR, capacité zones              |
-- | service_client 1 | accueil@sib2026.test      | SIB2026sc!      | Inscription, lookup, remplacement badge  |
-- | service_client 2 | accueil2@sib2026.test     | SIB2026sc2!     | 2e poste impression / accueil            |
-- | exhibitor        | exposant@sib2026.test     | SIB2026exp!     | Stand, leads, rendez-vous                |
-- | partner          | partenaire@sib2026.test   | SIB2026par!     | Médiathèque, partenariats                |
-- | visitor (free)   | visiteur@sib2026.test     | SIB2026vis!     | Badge gratuit, explore                   |
-- | visitor (VIP)    | visiteur.vip@sib2026.test | SIB2026vip!     | Badge VIP, accès lounge                  |
-- =============================================================================
