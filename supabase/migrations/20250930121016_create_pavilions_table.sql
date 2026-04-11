/*
  # Create pavilions table for SIPORTS 2026

  1. New Tables
    - `pavilions`
      - `id` (uuid, primary key)
      - `name` (text, pavilion name)
      - `slug` (text, URL-friendly identifier)
      - `description` (text, detailed description)
      - `color` (text, brand color for the pavilion)
      - `icon` (text, icon identifier)
      - `order_index` (integer, display order)
      - `featured` (boolean, featured pavilion flag)
      - `image_url` (text, pavilion image)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `pavilions` table
    - Add policy for public read access (anyone can view pavilions)
    - Add policy for authenticated admin users to manage pavilions
*/

CREATE TABLE IF NOT EXISTS pavilions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Anchor',
  order_index integer DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pavilions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pavilions"
  ON pavilions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pavilions"
  ON pavilions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can update pavilions"
  ON pavilions FOR UPDATE
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

CREATE POLICY "Admins can delete pavilions"
  ON pavilions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pavilions_slug ON pavilions(slug);
CREATE INDEX IF NOT EXISTS idx_pavilions_featured ON pavilions(featured);
CREATE INDEX IF NOT EXISTS idx_pavilions_order ON pavilions(order_index);