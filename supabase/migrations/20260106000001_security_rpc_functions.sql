-- 🔐 SECURITY RPC FUNCTIONS FOR APPOINTMENT VALIDATION
-- Created: 6 Jan 2026
-- These functions provide server-side validation for all appointment operations

-- ============================================================================
-- 1. VALIDATE APPOINTMENT QUOTA
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_appointment_quota(
  p_user_id UUID,
  p_visitor_level TEXT DEFAULT 'free'
)
RETURNS TABLE (
  is_valid BOOLEAN,
  current_count INTEGER,
  allowed_quota INTEGER,
  message TEXT
) AS $$
DECLARE
  v_count INTEGER;
  v_quota INTEGER;
BEGIN
  -- Determine quota based on visitor level
  CASE p_visitor_level
    WHEN 'free' THEN v_quota := 0;
    WHEN 'premium' THEN v_quota := 10;
    WHEN 'vip' THEN v_quota := 10;
    ELSE v_quota := 0;
  END CASE;

  -- Count confirmed appointments for this user
  SELECT COUNT(*) INTO v_count
  FROM appointments
  WHERE visitor_id = p_user_id AND status = 'confirmed';

  RETURN QUERY SELECT
    (v_count < v_quota) AS is_valid,
    v_count,
    v_quota,
    CASE
      WHEN v_count >= v_quota THEN format('Quota exceeded: %s/%s appointments', v_count, v_quota)
      ELSE 'OK'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. VALIDATE TIME SLOT CREATION PERMISSION
-- ============================================================================
CREATE OR REPLACE FUNCTION can_create_time_slot(p_user_id UUID)
RETURNS TABLE (
  is_allowed BOOLEAN,
  user_type TEXT,
  reason TEXT
) AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  -- Get user type
  SELECT type INTO v_user_type
  FROM users
  WHERE id = p_user_id;

  -- Only exhibitor and partner types can create time slots
  IF v_user_type IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'User not found';
  ELSIF v_user_type NOT IN ('exhibitor', 'partner') THEN
    RETURN QUERY SELECT false, v_user_type, format('Permission denied: %s cannot create time slots', v_user_type);
  ELSE
    RETURN QUERY SELECT true, v_user_type, 'OK';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. VALIDATE APPOINTMENT STATUS UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_appointment_update(
  p_appointment_id UUID,
  p_new_status TEXT,
  p_actor_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  reason TEXT,
  appointment_record JSONB
) AS $$
DECLARE
  v_appointment RECORD;
  v_actor_type TEXT;
  v_current_status TEXT;
BEGIN
  -- Get appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF v_appointment IS NULL THEN
    RETURN QUERY SELECT false, 'Appointment not found', NULL::JSONB;
    RETURN;
  END IF;

  -- Get actor type
  SELECT type INTO v_actor_type
  FROM users
  WHERE id = p_actor_id;

  v_current_status := v_appointment.status;

  -- Validate status transitions
  CASE
    WHEN v_current_status = 'pending' AND p_new_status IN ('confirmed', 'rejected') THEN
      -- Exhibitor can confirm/reject pending
      IF v_actor_type = 'exhibitor' AND v_appointment.exhibitor_id = p_actor_id THEN
        RETURN QUERY SELECT true, 'OK', row_to_json(v_appointment)::JSONB;
      ELSE
        RETURN QUERY SELECT false, 'Only exhibitor can change status', row_to_json(v_appointment)::JSONB;
      END IF;
    WHEN v_current_status = 'confirmed' AND p_new_status = 'cancelled' THEN
      -- Visitor or exhibitor can cancel
      IF v_actor_type IN ('visitor', 'exhibitor') THEN
        RETURN QUERY SELECT true, 'OK', row_to_json(v_appointment)::JSONB;
      ELSE
        RETURN QUERY SELECT false, 'Permission denied', row_to_json(v_appointment)::JSONB;
      END IF;
    ELSE
      RETURN QUERY SELECT false, format('Invalid status transition: %s -> %s', v_current_status, p_new_status), row_to_json(v_appointment)::JSONB;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CHECK USER PAYMENT STATUS
-- ============================================================================
CREATE OR REPLACE FUNCTION check_payment_status(p_exhibitor_id UUID)
RETURNS TABLE (
  is_paid BOOLEAN,
  payment_status TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  stand_size TEXT
) AS $$
DECLARE
  v_exhibitor RECORD;
BEGIN
  SELECT * INTO v_exhibitor
  FROM users
  WHERE id = p_exhibitor_id AND type = 'exhibitor';

  IF v_exhibitor IS NULL THEN
    RETURN QUERY SELECT false, 'Not an exhibitor', NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
    RETURN;
  END IF;

  -- Return payment info from profile
  RETURN QUERY SELECT
    (v_exhibitor.profile->>'payment_status' = 'paid')::BOOLEAN,
    COALESCE(v_exhibitor.profile->>'payment_status', 'unpaid'),
    (v_exhibitor.profile->>'payment_date')::TIMESTAMP WITH TIME ZONE,
    v_exhibitor.profile->>'stand_size';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. ATOMIC APPOINTMENT CREATION (WITH QUOTA CHECK)
-- ============================================================================
CREATE OR REPLACE FUNCTION create_appointment_atomic(
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_time_slot_id UUID,
  p_visitor_level TEXT,
  p_message TEXT DEFAULT ''
)
RETURNS TABLE (
  success BOOLEAN,
  appointment_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_new_appointment_id UUID;
  v_quota_check RECORD;
  v_count INTEGER;
BEGIN
  -- 1. Validate quota
  SELECT * INTO v_quota_check
  FROM validate_appointment_quota(p_visitor_id, p_visitor_level);

  IF NOT v_quota_check.is_valid THEN
    RETURN QUERY SELECT false, NULL::UUID, v_quota_check.message;
    RETURN;
  END IF;

  -- 2. Create appointment in transaction
  BEGIN
    INSERT INTO appointments (
      id,
      visitor_id,
      exhibitor_id,
      time_slot_id,
      status,
      message,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      p_visitor_id,
      p_exhibitor_id,
      p_time_slot_id,
      'pending',
      p_message,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_new_appointment_id;

    RETURN QUERY SELECT true, v_new_appointment_id, 'Appointment created successfully';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::UUID, SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION validate_appointment_quota(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_time_slot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_appointment_update(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_payment_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_appointment_atomic(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION validate_appointment_quota IS 'Validates if a user has remaining quota for appointments';
COMMENT ON FUNCTION can_create_time_slot IS 'Checks if user has permission to create time slots (exhibitor/partner only)';
COMMENT ON FUNCTION validate_appointment_update IS 'Validates appointment status transitions based on user role';
COMMENT ON FUNCTION check_payment_status IS 'Returns payment status of an exhibitor';
COMMENT ON FUNCTION create_appointment_atomic IS 'Creates appointment with atomic quota validation';
