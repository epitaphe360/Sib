-- ============================================================
-- Migration : Fix cancel_appointment_atomic
-- Date: 2026-04-28
-- Problème : FOR UPDATE ne peut pas s'appliquer au côté nullable
--            d'un LEFT JOIN (erreur PostgreSQL)
-- Fix      : FOR UPDATE OF a (lock uniquement la table appointments)
-- ============================================================

DROP FUNCTION IF EXISTS cancel_appointment_atomic(UUID, UUID);

CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id UUID,
  p_user_id        UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment        RECORD;
  v_time_slot_id       UUID;
  v_current_bookings   INTEGER;
  v_new_bookings       INTEGER;
BEGIN
  -- 1. Verrouiller uniquement la ligne appointments (FOR UPDATE OF a)
  --    On NE verrouille PAS time_slots ici pour éviter l'erreur PostgreSQL
  --    "FOR UPDATE cannot be applied to the nullable side of an outer join"
  SELECT a.*
  INTO v_appointment
  FROM appointments a
  WHERE a.id = p_appointment_id
  FOR UPDATE OF a;

  -- 2. Vérifier que le RDV existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rendez-vous introuvable'
    );
  END IF;

  -- 3. Vérifier l'autorisation (visiteur OU exposant/partenaire)
  IF v_appointment.visitor_id != p_user_id AND v_appointment.exhibitor_id != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Non autorisé à annuler ce rendez-vous'
    );
  END IF;

  -- 4. Vérifier que le RDV n'est pas déjà annulé
  IF v_appointment.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce rendez-vous est déjà annulé'
    );
  END IF;

  -- 5. Annuler le rendez-vous
  UPDATE appointments
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_appointment_id;

  -- 6. Décrémenter le compteur du créneau (si applicable)
  v_time_slot_id := v_appointment.time_slot_id;
  IF v_time_slot_id IS NOT NULL THEN
    -- Récupérer et verrouiller le créneau séparément
    SELECT current_bookings
    INTO v_current_bookings
    FROM time_slots
    WHERE id = v_time_slot_id
    FOR UPDATE;

    v_new_bookings := GREATEST(0, COALESCE(v_current_bookings, 1) - 1);

    UPDATE time_slots
    SET current_bookings = v_new_bookings,
        available        = true,
        updated_at       = NOW()
    WHERE id = v_time_slot_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rendez-vous annulé avec succès'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_appointment_atomic(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION cancel_appointment_atomic IS
  'Annule atomiquement un rendez-vous et libère le créneau. Fix: FOR UPDATE OF a (évite l''erreur LEFT JOIN nullable side).';
