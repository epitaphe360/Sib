/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (enum: webinar, roundtable, networking, workshop, conference)
      - `event_date` (timestamp)
      - `start_time` (time)
      - `end_time` (time)
      - `capacity` (integer)
      - `registered` (integer)
      - `category` (text)
      - `virtual` (boolean)
      - `featured` (boolean)
      - `location` (text, nullable)
      - `meeting_link` (text, nullable)
      - `tags` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `events` table
    - Add policies for public read access
    - Add policies for admins to manage events
*/

-- Create event type enum
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
  capacity integer NOT NULL DEFAULT 50,
  registered integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  virtual boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
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
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND type = 'admin'
    )
  );