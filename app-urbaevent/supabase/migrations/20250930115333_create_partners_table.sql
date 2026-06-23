/*
  # Create partners table

  1. New Tables
    - `partners`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Partner name
      - `type` (text, not null) - platinum, gold, silver, bronze, institutional
      - `category` (text, not null) - Partner category
      - `description` (text, not null) - Partner description
      - `logo_url` (text) - Logo URL
      - `website` (text) - Website URL
      - `country` (text, not null) - Country
      - `sector` (text, not null) - Sector/industry
      - `verified` (boolean, default false) - Verification status
      - `featured` (boolean, default false) - Featured status
      - `sponsorship_level` (text, not null) - Sponsorship level
      - `contributions` (text[]) - List of contributions
      - `established_year` (integer) - Year established
      - `employees` (text) - Number of employees
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp

  2. Security
    - Enable RLS on `partners` table
    - Add policy for public read access
    - Add policy for authenticated users to read
    - Add policy for admins to manage partners
*/

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  country text NOT NULL,
  sector text NOT NULL,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  sponsorship_level text NOT NULL,
  contributions text[] DEFAULT '{}',
  established_year integer,
  employees text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view partners"
  ON partners
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated can view partners"
  ON partners
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage partners"
  ON partners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );