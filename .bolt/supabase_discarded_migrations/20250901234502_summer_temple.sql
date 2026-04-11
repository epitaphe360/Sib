/*
  # Create exhibitors table

  1. New Tables
    - `exhibitors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `company_name` (text)
      - `category` (enum)
      - `sector` (text)
      - `description` (text)
      - `logo_url` (text, nullable)
      - `website` (text, nullable)
      - `verified` (boolean)
      - `featured` (boolean)
      - `contact_info` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `exhibitors` table
    - Add policies for exhibitors to manage their own data
    - Add policies for public read access
*/

-- Create exhibitor category enum
CREATE TYPE exhibitor_category AS ENUM ('institutional', 'port-industry', 'port-operations', 'academic');

-- Create exhibitors table
CREATE TABLE IF NOT EXISTS exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  category exhibitor_category NOT NULL,
  sector text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  contact_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read exhibitors"
  ON exhibitors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exhibitors can manage own data"
  ON exhibitors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = exhibitors.user_id 
      AND auth.uid()::text = users.id::text
    )
  );

CREATE POLICY "Admins can manage all exhibitors"
  ON exhibitors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND type = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_exhibitors_updated_at
  BEFORE UPDATE ON exhibitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();