-- ========================================
-- Fix RLS Policies and Add User Status Column
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix broken RLS policies and add missing status column
-- Issues:
--   1. time_slots RLS references non-existent user_id column
--   2. users table missing status column for account management
-- ========================================

-- ========================================
-- 1. ADD STATUS COLUMN TO USERS TABLE
-- ========================================

-- Create user_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
  END IF;
END $$;

-- Add status column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Update existing users to 'active' status
UPDATE users
SET status = 'active'
WHERE status IS NULL;

-- ========================================
-- 2. FIX TIME_SLOTS RLS POLICIES
-- ========================================

-- Drop broken policies that reference non-existent user_id column
DROP POLICY IF EXISTS "Users can manage own slots" ON time_slots;
DROP POLICY IF EXISTS "Users can manage their own time slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;

-- Create correct policies using exhibitor_id
CREATE POLICY "Exhibitors can manage their own time slots"
  ON time_slots FOR ALL
  USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  TO anon
  USING (available = true);

-- ========================================
-- 3. FIX APPOINTMENTS RLS POLICIES
-- ========================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;

-- Create comprehensive policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = visitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

CREATE POLICY "Visitors can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Exhibitors can update appointments"
  ON appointments FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

CREATE POLICY "Users can cancel their own appointments"
  ON appointments FOR DELETE
  USING (
    auth.uid() = visitor_id
    OR auth.uid() IN (
      SELECT user_id FROM exhibitors WHERE id = exhibitor_id
    )
  );

-- ========================================
-- 4. ADD HELPER FUNCTIONS FOR STATUS MANAGEMENT
-- ========================================

-- Function to activate pending user
CREATE OR REPLACE FUNCTION activate_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can activate users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can activate users';
  END IF;

  UPDATE users
  SET status = 'active'
  WHERE id = p_user_id AND status = 'pending';

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Compte activé',
    'Votre compte a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
    'success',
    'user',
    p_user_id
  );
END;
$$;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can suspend users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;

  UPDATE users
  SET status = 'suspended'
  WHERE id = p_user_id;

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Compte suspendu',
    COALESCE(
      'Votre compte a été suspendu. Raison: ' || p_reason,
      'Votre compte a été suspendu. Veuillez contacter le support.'
    ),
    'warning',
    'user',
    p_user_id
  );
END;
$$;

-- Function to reject user application
CREATE OR REPLACE FUNCTION reject_user(
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- Only admins can reject users
  SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();
  IF v_current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;

  UPDATE users
  SET status = 'rejected'
  WHERE id = p_user_id;

  -- Create notification for user
  PERFORM create_notification(
    p_user_id,
    'Candidature rejetée',
    COALESCE(
      'Votre candidature a été rejetée. Raison: ' || p_reason,
      'Votre candidature a été rejetée. Veuillez contacter le support pour plus d\'informations.'
    ),
    'error',
    'user',
    p_user_id
  );
END;
$$;

-- Function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status user_status;
BEGIN
  SELECT status INTO v_status FROM users WHERE id = p_user_id;
  RETURN v_status = 'active';
END;
$$;

-- ========================================
-- 5. UPDATE EXISTING RLS POLICIES TO CHECK STATUS
-- ========================================

-- Add status check to users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Active users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id AND status = 'active')
  WITH CHECK (auth.uid() = id AND status = 'active');

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ========================================
-- 6. ADD STATUS VALIDATION TRIGGER
-- ========================================

-- Prevent status changes from non-admins
CREATE OR REPLACE FUNCTION validate_user_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_current_user_type text;
BEGIN
  -- If status is being changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Check if current user is admin
    SELECT type INTO v_current_user_type FROM users WHERE id = auth.uid();

    -- Only admins or the user themselves (for specific transitions) can change status
    IF v_current_user_type != 'admin' AND auth.uid() != NEW.id THEN
      RAISE EXCEPTION 'Only admins can change user status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_status_change_trigger ON users;
CREATE TRIGGER validate_user_status_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_status_change();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN users.status IS 'Account status: pending (awaiting approval), active (can use platform), suspended (temporarily blocked), rejected (denied access)';
COMMENT ON FUNCTION activate_user(uuid) IS 'Activate a pending user account (admin only)';
COMMENT ON FUNCTION suspend_user(uuid, text) IS 'Suspend a user account (admin only)';
COMMENT ON FUNCTION reject_user(uuid, text) IS 'Reject a user application (admin only)';

-- ========================================
-- END OF MIGRATION
-- ========================================
