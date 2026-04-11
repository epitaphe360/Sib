-- Fix public access policies for exhibitors and mini-sites
-- Allow public read access to exhibitors and published mini-sites
-- Keep contact features (appointments, messages) authenticated-only

-- First, fix the users table which might be causing infinite recursion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any problematic policies that might reference users recursively
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Re-enable RLS with simpler policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policy for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Now fix exhibitors table
ALTER TABLE exhibitors DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Users can read own exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Authenticated users can read exhibitors" ON exhibitors;

-- Re-enable RLS with simple public policy
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Create simple public read policy
CREATE POLICY "Public can read exhibitors"
  ON exhibitors
  FOR SELECT
  TO public
  USING (true);

-- Same for mini_sites
ALTER TABLE mini_sites DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites" ON mini_sites;

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published mini-sites"
  ON mini_sites
  FOR SELECT
  TO public
  USING (published = true);
