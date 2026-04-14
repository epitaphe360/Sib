-- ========================================
-- AJOUTER UN COMPTE ADMIN DE TEST
-- ========================================
-- Email: admin-test@test.sib2026.ma
-- Mot de passe: Test@123456
-- ========================================

-- Créer l'utilisateur admin de test
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
ON CONFLICT (email) DO NOTHING;

-- Log de confirmation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'admin-test@test.sib2026.ma') THEN
    RAISE NOTICE '✅ Admin test account created: admin-test@test.sib2026.ma';
  ELSE
    RAISE NOTICE '⚠️ Failed to create admin test account';
  END IF;
END $$;
