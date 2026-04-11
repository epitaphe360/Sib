-- Fix exhibitors RLS to allow public read access
-- Drop the existing authenticated-only policy
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Create new policy for public read
CREATE POLICY "Anyone can read exhibitors"
  ON exhibitors
  FOR SELECT
  TO public
  USING (true);
