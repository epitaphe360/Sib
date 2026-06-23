-- Fix RLS Policies for users table
-- This script ensures admins can see all users and users can see/edit their own profile.
-- It also fixes the potential infinite recursion by using a SECURITY DEFINER function.

BEGIN;

-- 1. Create or update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
  -- We use a subquery with a limit to be efficient
  -- SECURITY DEFINER bypasses RLS for this specific query
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND type = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- 2. Enable RLS on users table (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing problematic policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can create user during signup" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;

-- 4. Create new clean policies

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow public insertion (for signup)
CREATE POLICY "Allow public insertion"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. Fix registration_requests policies which might be failing due to RLS on users
DROP POLICY IF EXISTS "Admins can view all registration requests" ON public.registration_requests;
CREATE POLICY "Admins can view all registration requests"
  ON public.registration_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update registration requests" ON public.registration_requests;
CREATE POLICY "Admins can update registration requests"
  ON public.registration_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

COMMIT;

-- Verification query
SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE tablename IN ('users', 'registration_requests');
