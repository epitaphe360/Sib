-- Migration: Atomic Appointment Booking Function
-- Description: Crée une fonction PostgreSQL pour gérer les réservations de rendez-vous
--              de manière atomique, évitant ainsi les problèmes de double-booking
-- Date: 2025-10-30

-- Fonction pour créer un rendez-vous de manière atomique
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_message TEXT DEFAULT NULL,
  p_meeting_type TEXT DEFAULT 'in-person'
) RETURNS TABLE(
  appointment_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_current_bookings INTEGER;
  v_max_bookings INTEGER;
  v_appointment_id UUID;
BEGIN
  -- Lock the time_slot row for update to prevent concurrent access
  SELECT current_bookings, max_bookings
  INTO v_current_bookings, v_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if time slot exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Créneau horaire introuvable'::TEXT;
    RETURN;
  END IF;

  -- Check availability
  IF v_current_bookings >= v_max_bookings THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Créneau complet'::TEXT;
    RETURN;
  END IF;

  -- Check if visitor already has an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE time_slot_id = p_time_slot_id
    AND visitor_id = p_visitor_id
  ) THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Vous avez déjà réservé ce créneau'::TEXT;
    RETURN;
  END IF;

  -- Insert appointment
  INSERT INTO appointments (
    time_slot_id,
    visitor_id,
    exhibitor_id,
    message,
    status,
    meeting_type,
    created_at
  ) VALUES (
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    p_message,
    'pending',
    p_meeting_type,
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Increment current_bookings and update availability
  UPDATE time_slots
  SET
    current_bookings = current_bookings + 1,
    available = (current_bookings + 1) < max_bookings
  WHERE id = p_time_slot_id;

  -- Return success
  RETURN QUERY SELECT v_appointment_id, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider un exposant et son utilisateur de manière atomique
CREATE OR REPLACE FUNCTION validate_exhibitor_atomic(
  p_exhibitor_id UUID,
  p_new_status TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  company_name TEXT,
  success BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_company_name TEXT;
  v_new_user_status TEXT;
BEGIN
  -- Determine new user status
  v_new_user_status := CASE
    WHEN p_new_status = 'approved' THEN 'active'
    WHEN p_new_status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END;

  -- Get exhibitor info and lock for update
  SELECT e.user_id, e.company_name
  INTO v_user_id, v_company_name
  FROM exhibitors e
  WHERE e.id = p_exhibitor_id
  FOR UPDATE;

  -- Check if exhibitor exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Update exhibitor verified status
  UPDATE exhibitors
  SET
    verified = (p_new_status = 'approved'),
    updated_at = NOW()
  WHERE id = p_exhibitor_id;

  -- Update user status
  UPDATE users
  SET
    status = v_new_user_status,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Get user info for email notification
  SELECT email, name
  INTO v_user_email, v_user_name
  FROM users
  WHERE id = v_user_id;

  -- Update registration request status if exists
  UPDATE registration_requests
  SET
    status = p_new_status,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Return user info for email notification
  RETURN QUERY SELECT v_user_id, v_user_email, v_user_name, v_company_name, TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider un partenaire de manière atomique
CREATE OR REPLACE FUNCTION validate_partner_atomic(
  p_partner_id UUID,
  p_new_status TEXT
) RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  partner_name TEXT,
  success BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_partner_name TEXT;
  v_new_user_status TEXT;
BEGIN
  -- Determine new user status
  v_new_user_status := CASE
    WHEN p_new_status = 'approved' THEN 'active'
    WHEN p_new_status = 'rejected' THEN 'rejected'
    ELSE 'pending'
  END;

  -- Get partner info and lock for update
  SELECT p.user_id, p.name
  INTO v_user_id, v_partner_name
  FROM partners p
  WHERE p.id = p_partner_id
  FOR UPDATE;

  -- Check if partner exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Update partner verified status
  UPDATE partners
  SET
    verified = (p_new_status = 'approved'),
    updated_at = NOW()
  WHERE id = p_partner_id;

  -- Update user status
  UPDATE users
  SET
    status = v_new_user_status,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Get user info for email notification
  SELECT email, name
  INTO v_user_email, v_user_name
  FROM users
  WHERE id = v_user_id;

  -- Update registration request status if exists
  UPDATE registration_requests
  SET
    status = p_new_status,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  -- Return user info for email notification
  RETURN QUERY SELECT v_user_id, v_user_email, v_user_name, v_partner_name, TRUE;
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON FUNCTION book_appointment_atomic IS 'Crée un rendez-vous de manière atomique avec vérification de disponibilité et incrémentation du compteur';
COMMENT ON FUNCTION validate_exhibitor_atomic IS 'Valide un exposant et met à jour le statut utilisateur de manière atomique';
COMMENT ON FUNCTION validate_partner_atomic IS 'Valide un partenaire et met à jour le statut utilisateur de manière atomique';
