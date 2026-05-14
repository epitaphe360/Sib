-- ========================================
-- CRÉATION DES COMPTES DE TEST E2E
-- ========================================
-- Tous les mots de passe: Test@1234567
-- Hash bcrypt: $2a$10$YourHashHere (à générer)
-- ========================================

-- NOTE: Les mots de passe doivent être créés via auth.users
-- Ce script crée les profils users, les auth seront créés via l'API

-- 1. VISITEUR GRATUIT
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'v0000000-0000-0000-0000-000000000001',
  'visitor-free@test.sib2026.ma',
  'Visiteur Free Test',
  'visitor',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 2. VISITEUR VIP
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'v0000000-0000-0000-0000-000000000002',
  'visitor-vip@test.sib2026.ma',
  'Visiteur VIP Test',
  'visitor',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 4. EXPOSANT 9m²
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'exhibitor-9m@test.sib2026.ma',
  'Exposant 9m² Test',
  'exhibitor',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 5. EXPOSANT 18m²
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'e0000000-0000-0000-0000-000000000002',
  'exhibitor-18m@test.sib2026.ma',
  'Exposant 18m² Test',
  'exhibitor',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 6. EXPOSANT 36m²
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'e0000000-0000-0000-0000-000000000003',
  'exhibitor-36m@test.sib2026.ma',
  'Exposant 36m² Test',
  'exhibitor',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 7. PARTENAIRE MUSÉE
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'p0000000-0000-0000-0000-000000000001',
  'partner-museum@test.sib2026.ma',
  'Partenaire Musée Test',
  'partner',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 8. PARTENAIRE CHAMBRE COMMERCE
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'p0000000-0000-0000-0000-000000000002',
  'partner-chamber@test.sib2026.ma',
  'Partenaire Chambre Test',
  'partner',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 9. PARTENAIRE SPONSOR
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'p0000000-0000-0000-0000-000000000003',
  'partner-sponsor@test.sib2026.ma',
  'Partenaire Sponsor Test',
  'partner',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 10. ADMIN
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000099',
  'admin-test@test.sib2026.ma',
  'Admin Test',
  'admin',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- ========================================
-- CONFIRMATION
-- ========================================
DO $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users WHERE email LIKE '%@test.sib2026.ma';
  RAISE NOTICE '✅ % comptes de test créés dans users table', user_count;
  
  IF user_count >= 10 THEN
    RAISE NOTICE '✅ Tous les comptes de test sont créés';
  ELSE
    RAISE NOTICE '⚠️  Seulement % comptes créés sur 10', user_count;
  END IF;
END $$;
