-- ================================================================
-- RLS PAYMENT FIX (42501 Error)
-- ================================================================
-- This SQL fixes the "new row violates row-level security policy"
-- error that occurs when trying to create payment records
--
-- ERROR: new row violates row-level security policy for table payment_requests
-- CODE: 42501 (Permission denied)
-- ================================================================

-- Step 1: Disable RLS temporarily (for admin use only)
ALTER TABLE payment_requests DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (both old and new names)
-- Old names:
DROP POLICY IF EXISTS "Users can view their own payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can insert own payments" ON payment_requests;
DROP POLICY IF EXISTS "Users can update their own payments" ON payment_requests;
DROP POLICY IF EXISTS "Admin can manage all payments" ON payment_requests;

-- New names (in case they were already created):
DROP POLICY IF EXISTS "Users can create their own payment records" ON payment_requests;
DROP POLICY IF EXISTS "Users can view their own payment records" ON payment_requests;
DROP POLICY IF EXISTS "Users can update their own payment records" ON payment_requests;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payment_requests;

-- Any other variations:
DROP POLICY IF EXISTS "allow_user_create_payments" ON payment_requests;
DROP POLICY IF EXISTS "allow_user_view_payments" ON payment_requests;
DROP POLICY IF EXISTS "allow_user_update_payments" ON payment_requests;
DROP POLICY IF EXISTS "allow_admin_manage_payments" ON payment_requests;

-- Step 3: Re-enable RLS
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, permissive policies for payment creation

-- ✅ Policy 1: Allow authenticated users to INSERT their own payment records
CREATE POLICY "Users can create their own payment records"
  ON payment_requests
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );

-- ✅ Policy 2: Allow users to VIEW their own payment records
CREATE POLICY "Users can view their own payment records"
  ON payment_requests
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );

-- ✅ Policy 3: Allow users to UPDATE their own payment records
-- (For payment status updates from payment gateways)
CREATE POLICY "Users can update their own payment records"
  ON payment_requests
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );

-- ✅ Policy 4: Admin bypass - Allow admins to manage all payments
CREATE POLICY "Admins can manage all payments"
  ON payment_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- ================================================================
-- Verification Script - Run these to verify the fix
-- ================================================================

-- Check 1: Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'payment_requests';

-- Check 2: List all policies on payment_requests
SELECT
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'payment_requests'
ORDER BY policyname;

-- Check 3: Verify no syntax errors in policies
-- (If this returns results, check those policies)
SELECT
  p.policyname,
  p.cmd
FROM pg_policies p
WHERE p.tablename = 'payment_requests'
AND p.policyname IN (
  'Users can create their own payment records',
  'Users can view their own payment records',
  'Users can update their own payment records',
  'Admins can manage all payments'
);

-- ================================================================
-- Testing: Insert a test payment record (as authenticated user)
-- ================================================================
-- Uncomment and run as an authenticated user to test:
--
-- INSERT INTO payment_requests (
--   user_id,
--   amount,
--   currency,
--   status,
--   provider,
--   created_at
-- ) VALUES (
--   auth.uid(),
--   99.99,
--   'MAD',
--   'pending',
--   'stripe',
--   NOW()
-- )
-- RETURNING id, user_id, amount, status;

-- ================================================================
-- Debugging: If errors persist
-- ================================================================

-- Check user permissions
-- SELECT auth.uid(), auth.role();

-- Check if user exists
-- SELECT id, type, status FROM users WHERE id = auth.uid();

-- Check if payment_requests table exists
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'payment_requests';

-- List all columns in payment_requests
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payment_requests'
-- ORDER BY ordinal_position;
