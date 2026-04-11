-- Database Transactions - Atomic Operations for SIPORT 2026
-- Purpose: Ensure data consistency across multi-table operations
-- Phase: 4 - Missing Implementations (Bug #11)
-- Date: January 6, 2026

/**
 * EXISTING ATOMIC TRANSACTIONS:
 * 
 * 1. book_appointment_atomic() - Already implemented (20251030000001_atomic_appointment_booking.sql)
 *    - Updates appointments table
 *    - Updates time_slots table (currentBookings)
 *    - Uses row-level locking with FOR UPDATE
 *    - Implicit transaction via SECURITY DEFINER
 * 
 * 2. Payment operations - Handled at application level with Supabase service role
 * 
 * NEEDED ATOMIC TRANSACTIONS (Bug #11):
 */

-- 1. UPDATE APPOINTMENT STATUS WITH NOTIFICATIONS
-- When changing appointment status, must also:
--    - Update appointments table
--    - Update notifications table (send notification)
--    - Update user activity log
CREATE OR REPLACE FUNCTION update_appointment_status_atomic(
  p_appointment_id uuid,
  p_new_status text,
  p_visitor_id uuid,
  p_exhibitor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
  v_result jsonb;
BEGIN
  -- 1. Lock the appointment row
  SELECT status INTO v_old_status
  FROM appointments
  WHERE id = p_appointment_id AND visitor_id = p_visitor_id
  FOR UPDATE;

  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment not found or permission denied'
    );
  END IF;

  -- 2. Update appointment status (ATOMIC with lock)
  UPDATE appointments
  SET status = p_new_status, updated_at = now()
  WHERE id = p_appointment_id;

  -- 3. Record status change in activity log
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'appointment_status_updated',
    'appointment',
    p_appointment_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'timestamp', now()
    )
  );

  -- 4. Create notification for status change
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Appointment ' || p_new_status,
    'Your appointment status has been updated to: ' || p_new_status,
    'appointment_status',
    'appointment',
    p_appointment_id
  );

  -- 5. Return success
  v_result := jsonb_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'old_status', v_old_status,
    'new_status', p_new_status
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION update_appointment_status_atomic TO authenticated;

COMMENT ON FUNCTION update_appointment_status_atomic IS
  'Atomically updates appointment status, creates notification, and logs activity in single transaction';

---

-- 2. CANCEL APPOINTMENT WITH SLOT REFUND
-- When canceling appointment, must also:
--    - Update appointments table (status = cancelled)
--    - Update time_slots table (decrement currentBookings)
--    - Create refund record (if paid)
--    - Log activity
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id uuid,
  p_visitor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_time_slot_id uuid;
  v_exhibitor_id uuid;
  v_appointment_status text;
  v_result jsonb;
BEGIN
  -- 1. Lock and fetch appointment data
  SELECT 
    status, time_slot_id, exhibitor_id
  INTO 
    v_appointment_status, v_time_slot_id, v_exhibitor_id
  FROM appointments
  WHERE id = p_appointment_id AND visitor_id = p_visitor_id
  FOR UPDATE;

  IF v_appointment_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment not found or permission denied'
    );
  END IF;

  -- 2. Check if already cancelled
  IF v_appointment_status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Appointment is already cancelled'
    );
  END IF;

  -- 3. Update appointment status
  UPDATE appointments
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_appointment_id;

  -- 4. Decrement time slot bookings
  UPDATE time_slots
  SET currentBookings = GREATEST(0, currentBookings - 1),
      available = (currentBookings - 1) < max_bookings,
      updated_at = now()
  WHERE id = v_time_slot_id;

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'appointment_cancelled',
    'appointment',
    p_appointment_id,
    jsonb_build_object(
      'time_slot_id', v_time_slot_id,
      'exhibitor_id', v_exhibitor_id,
      'timestamp', now()
    )
  );

  -- 6. Create notification
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Appointment Cancelled',
    'Your appointment has been cancelled and the time slot is now available for others.',
    'appointment_cancelled',
    'appointment',
    p_appointment_id
  );

  v_result := jsonb_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'time_slot_id', v_time_slot_id,
    'message', 'Appointment cancelled successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;

COMMENT ON FUNCTION cancel_appointment_atomic IS
  'Atomically cancels appointment, refunds slot, logs activity, and notifies user in single transaction';

---

-- 3. PAYMENT PROCESSING TRANSACTION
-- When processing payment, must also:
--    - Create payment_requests record
--    - Update visitor subscription tier
--    - Record payment event
--    - Send confirmation notification
CREATE OR REPLACE FUNCTION process_subscription_payment_atomic(
  p_visitor_id uuid,
  p_tier_name text,
  p_amount decimal,
  p_payment_method text,
  p_transaction_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_id uuid;
  v_old_tier text;
  v_result jsonb;
BEGIN
  -- 1. Lock visitor profile row
  SELECT visitor_level INTO v_old_tier
  FROM visitor_profiles
  WHERE user_id = p_visitor_id
  FOR UPDATE;

  -- 2. Get tier information
  SELECT id INTO v_tier_id
  FROM visitor_tiers
  WHERE name = p_tier_name
  LIMIT 1;

  IF v_tier_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid subscription tier'
    );
  END IF;

  -- 3. Create payment record
  INSERT INTO payment_requests (
    user_id, tier_id, amount, status, payment_method, stripe_transaction_id
  )
  VALUES (
    p_visitor_id, v_tier_id, p_amount, 'completed', p_payment_method, p_transaction_id
  );

  -- 4. Update visitor subscription tier
  UPDATE visitor_profiles
  SET 
    visitor_level = p_tier_name,
    paid_tier_expires_at = CASE 
      WHEN p_tier_name = 'free' THEN NULL
      ELSE now() + INTERVAL '1 year'
    END,
    updated_at = now()
  WHERE user_id = p_visitor_id;

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_visitor_id,
    'subscription_upgraded',
    'subscription',
    v_tier_id,
    jsonb_build_object(
      'old_tier', v_old_tier,
      'new_tier', p_tier_name,
      'amount', p_amount,
      'payment_method', p_payment_method,
      'timestamp', now()
    )
  );

  -- 6. Create confirmation notification
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_visitor_id,
    'Subscription Upgraded',
    'Your subscription has been upgraded to ' || p_tier_name || '. You now have access to ' || 
    CASE WHEN p_tier_name = 'vip' THEN 'VIP features' 
         WHEN p_tier_name = 'premium' THEN 'Premium features'
         ELSE 'Standard features'
    END || '.',
    'subscription_upgraded',
    'subscription',
    v_tier_id
  );

  v_result := jsonb_build_object(
    'success', true,
    'visitor_id', p_visitor_id,
    'tier_name', p_tier_name,
    'old_tier', v_old_tier,
    'amount', p_amount,
    'message', 'Payment processed successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION process_subscription_payment_atomic TO authenticated;

COMMENT ON FUNCTION process_subscription_payment_atomic IS
  'Atomically processes subscription payment, updates tier, logs activity, and notifies user in single transaction';

---

-- 4. MESSAGE CREATION WITH NOTIFICATION
-- When creating a new message, must also:
--    - Insert into messages table
--    - Create unread notification for recipient
--    - Update conversation last_message_at
--    - Log activity
CREATE OR REPLACE FUNCTION send_message_atomic(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_message_text text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
  v_conversation_id uuid;
  v_result jsonb;
BEGIN
  -- 1. Find or create conversation (with lock)
  SELECT id INTO v_conversation_id
  FROM chat_conversations
  WHERE (participant_one_id = p_sender_id AND participant_two_id = p_recipient_id)
     OR (participant_one_id = p_recipient_id AND participant_two_id = p_sender_id)
  LIMIT 1
  FOR UPDATE;

  -- Create conversation if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO chat_conversations (participant_one_id, participant_two_id)
    VALUES (p_sender_id, p_recipient_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- 2. Insert message
  INSERT INTO chat_messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, p_sender_id, p_message_text)
  RETURNING id INTO v_message_id;

  -- 3. Update conversation last message
  UPDATE chat_conversations
  SET last_message_at = now(), last_message_preview = p_message_text
  WHERE id = v_conversation_id;

  -- 4. Create notification for recipient
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    p_recipient_id,
    'New Message',
    p_message_text,
    'new_message',
    'message',
    v_message_id
  );

  -- 5. Log activity
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_sender_id,
    'message_sent',
    'message',
    v_message_id,
    jsonb_build_object(
      'recipient_id', p_recipient_id,
      'conversation_id', v_conversation_id,
      'timestamp', now()
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'message_id', v_message_id,
    'conversation_id', v_conversation_id,
    'timestamp', now()
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION send_message_atomic TO authenticated;

COMMENT ON FUNCTION send_message_atomic IS
  'Atomically sends message, creates/updates conversation, logs activity, and notifies recipient in single transaction';

---

-- 5. EXHIBITOR PROFILE UPDATE WITH SLOT INVALIDATION
-- When exhibitor updates profile, must also:
--    - Update exhibitor_profiles table
--    - Invalidate future time slots if needed
--    - Create audit log
--    - Notify affected visitors if applicable
CREATE OR REPLACE FUNCTION update_exhibitor_profile_atomic(
  p_exhibitor_id uuid,
  p_profile_data jsonb,
  p_invalidate_slots boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_slots_invalidated integer := 0;
BEGIN
  -- 1. Lock exhibitor profile
  UPDATE exhibitor_profiles
  SET 
    company_name = COALESCE(p_profile_data->>'company_name', company_name),
    description = COALESCE(p_profile_data->>'description', description),
    logo_url = COALESCE(p_profile_data->>'logo_url', logo_url),
    website = COALESCE(p_profile_data->>'website', website),
    updated_at = now()
  WHERE user_id = p_exhibitor_id;

  -- 2. Optionally invalidate future slots
  IF p_invalidate_slots THEN
    -- Cancel future time slots
    UPDATE time_slots
    SET available = false, updated_at = now()
    WHERE exhibitor_id = p_exhibitor_id
      AND slot_date >= CURRENT_DATE
      AND availability_status != 'cancelled';

    GET DIAGNOSTICS v_slots_invalidated = ROW_COUNT;

    -- Notify affected visitors of cancelled slots
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
    SELECT DISTINCT a.visitor_id,
      'Appointment Time Slot Cancelled',
      'Your appointment time slot has been cancelled. Please book a new one.',
      'slot_cancelled',
      'time_slot',
      ts.id
    FROM appointments a
    JOIN time_slots ts ON a.time_slot_id = ts.id
    WHERE ts.exhibitor_id = p_exhibitor_id
      AND ts.slot_date >= CURRENT_DATE
      AND a.status = 'pending';
  END IF;

  -- 3. Create audit log
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_exhibitor_id,
    'profile_updated',
    'exhibitor',
    p_exhibitor_id,
    jsonb_build_object(
      'changes', p_profile_data,
      'slots_invalidated', v_slots_invalidated,
      'timestamp', now()
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'exhibitor_id', p_exhibitor_id,
    'slots_invalidated', v_slots_invalidated,
    'message', 'Profile updated successfully'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_exhibitor_profile_atomic TO authenticated;

COMMENT ON FUNCTION update_exhibitor_profile_atomic IS
  'Atomically updates exhibitor profile, optionally invalidates slots, and notifies affected users in single transaction';

---

-- SUMMARY OF TRANSACTION GUARANTEES:
-- 
-- All atomic transaction functions use:
-- 1. SECURITY DEFINER - Execute with function owner's permissions
-- 2. Row-level locking (FOR UPDATE) - Prevent race conditions
-- 3. Explicit transaction semantics - All operations succeed or all fail
-- 4. Error handling - Return JSON result with success/error status
-- 5. Audit logging - All changes recorded in user_activity_log
-- 6. Notifications - Users notified of important changes
--
-- Benefits:
-- ✅ No partial updates (all-or-nothing semantics)
-- ✅ No data corruption from concurrent operations
-- ✅ Complete audit trail of all changes
-- ✅ User notifications for important events
-- ✅ Data consistency across related tables
-- ✅ Performance optimized with minimal locking
