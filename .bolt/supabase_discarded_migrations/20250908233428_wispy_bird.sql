/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (event_type enum)
      - `event_date` (timestamp)
      - `start_time` (time)
      - `end_time` (time)
      - `capacity` (integer)
      - `registered` (integer)
      - `category` (text)
      - `virtual` (boolean)
      - `featured` (boolean)
      - `location` (text, optional)
      - `meeting_link` (text, optional)
      - `tags` (text array)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `events` table
    - Add policies for public read and admin management
*/

-- Create event_type enum
CREATE TYPE event_type AS ENUM ('webinar', 'roundtable', 'networking', 'workshop', 'conference');

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type event_type NOT NULL,
  event_date timestamptz NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer DEFAULT 50,
  registered integer DEFAULT 0,
  category text NOT NULL,
  virtual boolean DEFAULT false,
  featured boolean DEFAULT false,
  location text,
  meeting_link text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all events"
  ON events
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = auth.uid()::text 
    AND users.type = 'admin'::user_type
  ));