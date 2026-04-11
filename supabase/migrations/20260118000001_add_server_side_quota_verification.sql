-- Migration: Add server-side quota verification for B2B appointments
-- Description: Prevents quota bypass by enforcing limits at database level
-- Date: 2026-01-18
-- Security: CRITICAL - Prevents fraud

-- ============================================================================
-- FONCTION: get_user_b2b_quota
-- Retourne le quota B2B d'un utilisateur selon son type
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_b2b_quota(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_user_type text;
  v_visitor_level text;
  v_quota integer;
BEGIN
  -- Récupérer le type et niveau de l'utilisateur
  SELECT type, visitor_level
  INTO v_user_type, v_visitor_level
  FROM users
  WHERE id = p_user_id;

  -- Déterminer le quota selon le type
  -- RÈGLES MÉTIER:
  -- - Exposants/Partenaires: ILLIMITÉ (999999)
  -- - Visiteurs VIP/Premium: 10 RDV
  -- - Visiteurs Gratuits: 0 RDV
  v_quota := CASE
    -- Types avec quota illimité
    WHEN v_user_type IN ('exhibitor', 'partner', 'admin', 'security') THEN 999999

    -- Visiteurs selon leur niveau
    WHEN v_user_type = 'visitor' THEN
      CASE v_visitor_level
        WHEN 'vip' THEN 10
        WHEN 'premium' THEN 10
        WHEN 'free' THEN 0
        ELSE 0
      END

    -- Par défaut: aucun quota
    ELSE 0
  END;

  RETURN v_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_b2b_quota IS
'Retourne le quota de rendez-vous B2B autorisé pour un utilisateur selon son type et niveau';

-- ============================================================================
-- FONCTION: check_b2b_quota_available
-- Vérifie si un utilisateur peut encore prendre un RDV
-- ============================================================================
CREATE OR REPLACE FUNCTION check_b2b_quota_available(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_quota integer;
  v_active_count integer;
  v_remaining integer;
BEGIN
  -- Obtenir le quota
  v_quota := get_user_b2b_quota(p_user_id);

  -- Compter les RDV actifs (pending + confirmed)
  SELECT COUNT(*)
  INTO v_active_count
  FROM appointments
  WHERE visitor_id = p_user_id
    AND status IN ('pending', 'confirmed')
    AND deleted_at IS NULL;

  -- Calculer les RDV restants
  v_remaining := GREATEST(0, v_quota - v_active_count);

  -- Retourner le résultat
  RETURN json_build_object(
    'quota', v_quota,
    'used', v_active_count,
    'remaining', v_remaining,
    'available', (v_quota > v_active_count OR v_quota = 999999),
    'is_unlimited', (v_quota = 999999)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_b2b_quota_available IS
'Vérifie la disponibilité du quota B2B pour un utilisateur';

-- ============================================================================
-- FONCTION AMÉLIORÉE: book_appointment_atomic
-- Ajout de la vérification de quota côté serveur
-- ============================================================================
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_visitor_id uuid,
  p_time_slot_id uuid,
  p_message text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  v_slot_exhibitor_id uuid;
  v_slot_available boolean;
  v_slot_max_bookings integer;
  v_current_bookings integer;
  v_new_appointment_id uuid;
  v_quota_check json;
BEGIN
  -- 🔐 ÉTAPE 1: Vérifier le quota B2B côté serveur
  v_quota_check := check_b2b_quota_available(p_visitor_id);

  IF NOT (v_quota_check->>'available')::boolean THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quota de rendez-vous atteint pour votre niveau',
      'quota_info', v_quota_check
    );
  END IF;

  -- ÉTAPE 2: Récupérer les infos du time slot avec LOCK
  SELECT exhibitor_id, available, max_bookings
  INTO v_slot_exhibitor_id, v_slot_available, v_slot_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE; -- Lock pessimiste

  -- Vérifier que le slot existe
  IF v_slot_exhibitor_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Créneau horaire introuvable'
    );
  END IF;

  -- Vérifier que le slot est disponible
  IF NOT v_slot_available THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce créneau n''est plus disponible'
    );
  END IF;

  -- ÉTAPE 3: Vérifier que le visiteur n'a pas déjà réservé ce slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE visitor_id = p_visitor_id
      AND time_slot_id = p_time_slot_id
      AND status IN ('pending', 'confirmed')
      AND deleted_at IS NULL
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous avez déjà réservé ce créneau'
    );
  END IF;

  -- ÉTAPE 4: Compter les réservations actuelles pour ce slot
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM appointments
  WHERE time_slot_id = p_time_slot_id
    AND status IN ('pending', 'confirmed')
    AND deleted_at IS NULL;

  -- Vérifier la capacité max
  IF v_current_bookings >= v_slot_max_bookings THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce créneau est complet'
    );
  END IF;

  -- ÉTAPE 5: Créer le rendez-vous
  INSERT INTO appointments (
    visitor_id,
    exhibitor_id,
    time_slot_id,
    status,
    message,
    created_at
  )
  VALUES (
    p_visitor_id,
    v_slot_exhibitor_id,
    p_time_slot_id,
    'pending', -- Status initial: en attente de confirmation
    p_message,
    NOW()
  )
  RETURNING id INTO v_new_appointment_id;

  -- ÉTAPE 6: Mettre à jour current_bookings du time_slot
  UPDATE time_slots
  SET current_bookings = v_current_bookings + 1
  WHERE id = p_time_slot_id;

  -- ÉTAPE 7: Retourner le succès avec les infos
  RETURN json_build_object(
    'success', true,
    'appointment_id', v_new_appointment_id,
    'quota_info', v_quota_check,
    'message', 'Demande de rendez-vous envoyée avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Gérer les erreurs
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la réservation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION book_appointment_atomic IS
'Réserve un rendez-vous B2B de manière atomique avec vérification de quota côté serveur';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Autoriser tous les utilisateurs authentifiés à appeler ces fonctions
GRANT EXECUTE ON FUNCTION get_user_b2b_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_b2b_quota_available(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION book_appointment_atomic(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- TESTS DE SÉCURITÉ
-- ============================================================================

-- Test 1: Vérifier qu'un visiteur gratuit a un quota de 0
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  -- Créer un utilisateur test
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('00000000-0000-0000-0000-000000000001', 'test_free@test.com', 'visitor', 'free')
  ON CONFLICT (id) DO UPDATE SET visitor_level = 'free';

  -- Vérifier le quota
  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000001');

  IF v_test_quota != 0 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur gratuit devrait avoir quota = 0, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 1 réussi: Visiteur gratuit a quota = 0';
END $$;

-- Test 2: Vérifier qu'un exposant a un quota illimité
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type)
  VALUES ('00000000-0000-0000-0000-000000000002', 'test_exhibitor@test.com', 'exhibitor')
  ON CONFLICT (id) DO UPDATE SET type = 'exhibitor';

  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000002');

  IF v_test_quota != 999999 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Exposant devrait avoir quota = 999999, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 2 réussi: Exposant a quota illimité (999999)';
END $$;

-- Test 3: Vérifier qu'un visiteur VIP a un quota de 10
DO $$
DECLARE
  v_test_quota integer;
BEGIN
  INSERT INTO users (id, email, type, visitor_level)
  VALUES ('00000000-0000-0000-0000-000000000003', 'test_vip@test.com', 'visitor', 'vip')
  ON CONFLICT (id) DO UPDATE SET visitor_level = 'vip';

  v_test_quota := get_user_b2b_quota('00000000-0000-0000-0000-000000000003');

  IF v_test_quota != 10 THEN
    RAISE EXCEPTION 'ÉCHEC TEST: Visiteur VIP devrait avoir quota = 10, obtenu = %', v_test_quota;
  END IF;

  RAISE NOTICE '✅ Test 3 réussi: Visiteur VIP a quota = 10';
END $$;

-- Nettoyage des utilisateurs de test
DELETE FROM users WHERE email LIKE 'test_%@test.com';

RAISE NOTICE '========================================';
RAISE NOTICE '✅ Migration terminée avec succès';
RAISE NOTICE '🔐 Vérification de quota côté serveur activée';
RAISE NOTICE '========================================';
