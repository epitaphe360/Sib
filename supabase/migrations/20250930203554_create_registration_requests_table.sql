/*
  # Create registration_requests table

  1. New Tables
    - `registration_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_type` (enum: exhibitor, partner, visitor)
      - `email` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `company_name` (text, nullable)
      - `position` (text, nullable)
      - `phone` (text)
      - `profile_data` (jsonb) - pour stocker toutes les données du profil
      - `status` (enum: pending, approved, rejected)
      - `created_at` (timestamp)
      - `reviewed_at` (timestamp, nullable)
      - `reviewed_by` (uuid, nullable, foreign key to users)
      - `rejection_reason` (text, nullable)

  2. Security
    - Enable RLS on `registration_requests` table
    - Add policy for users to view their own requests
    - Add policy for admins to view and manage all requests
    
  3. Indexes
    - Index on user_id for fast lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create status enum
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_requests table
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_id ON registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_type ON registration_requests(user_type);

-- Enable RLS
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own registration requests
CREATE POLICY "Users can view own registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
  ON registration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
  ON registration_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: System can insert registration requests (for signup process)
CREATE POLICY "Authenticated users can insert own registration requests"
  ON registration_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
