/*
  # Create pavilion_programs table for demo programs

  1. New Tables
    - `pavilion_programs`
      - `id` (uuid, primary key)
      - `pavilion_id` (uuid, foreign key to pavilions)
      - `title` (text, program title)
      - `time` (text, time slot)
      - `speaker` (text, speaker name)
      - `description` (text, program description)
      - `order_index` (integer, display order within pavilion)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `pavilion_programs` table
    - Add policy for public read access
    - Add policy for authenticated admin users to manage programs
*/

CREATE TABLE IF NOT EXISTS pavilion_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pavilion_id uuid REFERENCES pavilions(id) ON DELETE CASCADE,
  title text NOT NULL,
  time text NOT NULL,
  speaker text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pavilion_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pavilion programs"
  ON pavilion_programs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pavilion programs"
  ON pavilion_programs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "Admins can update pavilion programs"
  ON pavilion_programs FOR UPDATE
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

CREATE POLICY "Admins can delete pavilion programs"
  ON pavilion_programs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pavilion_programs_pavilion ON pavilion_programs(pavilion_id);
CREATE INDEX IF NOT EXISTS idx_pavilion_programs_order ON pavilion_programs(order_index);