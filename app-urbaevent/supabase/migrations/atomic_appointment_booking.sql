-- Fonction RPC pour booking atomique de rendez-vous
-- Prévient les race conditions et l'overbooking

-- Drop function if exists
DROP FUNCTION IF EXISTS book_appointment_atomic;

-- Create atomic booking function
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot RECORD;
  v_appointment_id UUID;
  v_result JSON;
BEGIN
  -- Lock the time slot row FOR UPDATE (prevents concurrent bookings)
  SELECT * INTO v_slot
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if slot exists
  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Time slot not found';
  END IF;

  -- Check if slot belongs to exhibitor
  IF v_slot.exhibitor_id != p_exhibitor_id THEN
    RAISE EXCEPTION 'Time slot does not belong to this exhibitor';
  END IF;

  -- Check if slot is available
  IF NOT v_slot.available THEN
    RAISE EXCEPTION 'Time slot is not available';
  END IF;

  -- Check if slot is not full
  IF v_slot.current_bookings >= v_slot.max_bookings THEN
    RAISE EXCEPTION 'Time slot is fully booked';
  END IF;

  -- Check if appointment is in the future
  IF v_slot.start_time < NOW() THEN
    RAISE EXCEPTION 'Cannot book past time slots';
  END IF;

  -- Check if visitor already has an appointment at this time
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE visitor_id = p_visitor_id
    AND time_slot_id IN (
      SELECT id FROM time_slots
      WHERE start_time = v_slot.start_time
    )
    AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You already have an appointment at this time';
  END IF;

  -- Create appointment
  INSERT INTO appointments (
    id,
    time_slot_id,
    visitor_id,
    exhibitor_id,
    status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    'confirmed',
    p_notes,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Update slot booking count
  UPDATE time_slots
  SET
    current_bookings = current_bookings + 1,
    available = (current_bookings + 1) < max_bookings,
    updated_at = NOW()
  WHERE id = p_time_slot_id;

  -- Return success result
  SELECT json_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'time_slot_id', p_time_slot_id,
    'current_bookings', v_slot.current_bookings + 1,
    'available', (v_slot.current_bookings + 1) < v_slot.max_bookings
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION book_appointment_atomic TO authenticated;

-- Create atomic cancel function
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
  v_result JSON;
BEGIN
  -- Lock appointment FOR UPDATE
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  -- Check if appointment exists
  IF v_appointment IS NULL THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;

  -- Check if user is authorized (visitor or exhibitor)
  IF v_appointment.visitor_id != p_user_id AND
     v_appointment.exhibitor_id NOT IN (
       SELECT id FROM exhibitors WHERE user_id = p_user_id
     ) THEN
    RAISE EXCEPTION 'Not authorized to cancel this appointment';
  END IF;

  -- Check if appointment is not already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RAISE EXCEPTION 'Appointment is already cancelled';
  END IF;

  -- Update appointment status
  UPDATE appointments
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Decrease slot booking count
  UPDATE time_slots
  SET
    current_bookings = GREATEST(0, current_bookings - 1),
    available = true,
    updated_at = NOW()
  WHERE id = v_appointment.time_slot_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'appointment_id', p_appointment_id
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;

-- Comments
COMMENT ON FUNCTION book_appointment_atomic IS 'Atomic appointment booking with row-level locking to prevent race conditions and overbooking';
COMMENT ON FUNCTION cancel_appointment_atomic IS 'Atomic appointment cancellation with proper slot count management';
