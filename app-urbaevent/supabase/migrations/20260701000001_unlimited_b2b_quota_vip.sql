-- Migration: RDV B2B illimités pour visiteurs VIP/Premium et exposants
-- Description: Le client demande un quota de rendez-vous B2B ILLIMITÉ pour tous
--   les visiteurs VIP/Premium et les exposants (les exposants/partenaires/admin/
--   sécurité étaient déjà illimités ; on aligne désormais VIP/Premium à 999999).
-- Date: 2026-07-01

-- ============================================================================
-- FONCTION: get_user_b2b_quota (mise à jour)
-- VIP/Premium passent de 10 à 999999 (illimité). FREE reste à 0.
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_b2b_quota(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_user_type text;
  v_visitor_level text;
  v_quota integer;
BEGIN
  SELECT type, visitor_level
  INTO v_user_type, v_visitor_level
  FROM users
  WHERE id = p_user_id;

  -- RÈGLES MÉTIER (édition 2026) :
  -- - Exposants/Partenaires/Admin/Sécurité : ILLIMITÉ (999999)
  -- - Visiteurs VIP/Premium : ILLIMITÉ (999999)
  -- - Visiteurs Gratuits : 0 RDV
  v_quota := CASE
    WHEN v_user_type IN ('exhibitor', 'partner', 'admin', 'security') THEN 999999

    WHEN v_user_type = 'visitor' THEN
      CASE v_visitor_level
        WHEN 'vip' THEN 999999
        WHEN 'premium' THEN 999999
        WHEN 'free' THEN 0
        ELSE 0
      END

    ELSE 0
  END;

  RETURN v_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_b2b_quota IS
'Quota de RDV B2B par utilisateur : illimité (999999) pour exposants/partenaires/admin/sécurité et visiteurs VIP/Premium ; 0 pour visiteurs gratuits';

-- ============================================================================
-- Table visitor_levels : refléter l'illimité pour VIP/Premium
-- (remplacement complet des JSON pour éviter jsonb_set si features/quotas
--  sont stockés en tableau [] en prod — erreur 22P02 "appointments")
-- ============================================================================
UPDATE visitor_levels
SET
  description = 'Accès VIP avec rendez-vous B2B illimités et tous les avantages premium - 700€ TTC',
  features = '{"appointments": 999999, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 999999, "connections_per_day": 9999, "favorites": 9999}'::jsonb
WHERE level IN ('vip', 'premium');

-- ============================================================================
-- TESTS DE SÉCURITÉ / NON-RÉGRESSION
-- ============================================================================

-- Visiteur VIP → illimité
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('ffffffff-0701-0001-0000-000000000001', 'test_vip_unlimited@test.internal', 'visitor', 'vip')
  ON CONFLICT (id) DO UPDATE SET type = 'visitor', visitor_level = 'vip';

  v_test_quota := get_user_b2b_quota('ffffffff-0701-0001-0000-000000000001');

  IF v_test_quota != 999999 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur VIP devrait avoir quota illimité (999999), obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Visiteur VIP a quota illimité (999999)';
END $$;

-- Exposant → illimité (inchangé)
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type)
  VALUES ('ffffffff-0701-0001-0000-000000000002', 'test_exhibitor_unlimited@test.internal', 'exhibitor')
  ON CONFLICT (id) DO UPDATE SET type = 'exhibitor';

  v_test_quota := get_user_b2b_quota('ffffffff-0701-0001-0000-000000000002');

  IF v_test_quota != 999999 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Exposant devrait avoir quota illimité (999999), obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Exposant a quota illimité (999999)';
END $$;

-- Visiteur gratuit → 0 (inchangé)
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('ffffffff-0701-0001-0000-000000000003', 'test_free_unlimited@test.internal', 'visitor', 'free')
  ON CONFLICT (id) DO UPDATE SET type = 'visitor', visitor_level = 'free';

  v_test_quota := get_user_b2b_quota('ffffffff-0701-0001-0000-000000000003');

  IF v_test_quota != 0 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur gratuit devrait avoir quota = 0, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Visiteur gratuit a quota = 0';
END $$;

DELETE FROM users WHERE email LIKE '%@test.internal';

-- Migration terminée : RDV B2B illimités pour VIP/Premium et exposants
