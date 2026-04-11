-- Fix public access policies for events
-- Allow public read access to events

-- Disable RLS to update policies
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Authenticated users can read events" ON events;

-- Re-enable RLS with public policy
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create simple public read policy for events
CREATE POLICY "Public can read events"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- Also ensure event_registrations has the right policy for authenticated users
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy for viewing registrations
CREATE POLICY "Users can see own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for creating registrations
CREATE POLICY "Users can register for events"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
