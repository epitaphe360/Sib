/*
  # Fix RLS policies for users table - Add INSERT policy

  1. Changes
    - Add INSERT policy to allow authenticated users to create their own user record
    - This is needed for the registration process where users create their profile

  2. Security
    - Users can only insert their own record (where id matches auth.uid())
    - This prevents users from creating profiles for other users
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create INSERT policy for authenticated users
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow service role to insert (for admin operations)
DROP POLICY IF EXISTS "Service role can manage users" ON users;

CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
