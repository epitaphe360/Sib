/*
  # Create appointments and time_slots tables

  1. New Tables
    - `time_slots`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `slot_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `duration` (integer, minutes)
      - `type` (enum: in-person, virtual, hybrid)
      - `max_bookings` (integer)
      - `current_bookings` (integer)
      - `available` (boolean)
      - `location` (text, nullable)
      - `created_at` (timestamp)

    - `appointments`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `visitor_id` (uuid, foreign key to users)
      - `time_slot_id` (uuid, foreign key to time_slots)
      - `status` (enum: pending, confirmed, cancelled, completed)
      - `message` (text, nullable)
      - `notes` (text, nullable)
      - `rating` (integer, nullable)
      - `created_at` (timestamp)
      - `meeting_type` (enum: in-person, virtual, hybrid)
      - `meeting_link` (text, nullable)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for each user type
*/

-- Create meeting type enum
CREATE TYPE meeting_type AS ENUM ('in-person', 'virtual', 'hybrid');

-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  type meeting_type NOT NULL DEFAULT 'in-person',
  max_bookings integer NOT NULL DEFAULT 1,
  current_bookings integer NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  status appointment_status NOT NULL DEFAULT 'pending',
  message text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  meeting_type meeting_type NOT NULL DEFAULT 'in-person',
  meeting_link text
);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Time slots policies
CREATE POLICY "Anyone can read time slots"
  ON time_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exhibitors can manage own time slots"
  ON time_slots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exhibitors e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = time_slots.exhibitor_id 
      AND auth.uid()::text = u.id::text
    )
  );

-- Appointments policies
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = visitor_id::text OR
    EXISTS (
      SELECT 1 FROM exhibitors e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = appointments.exhibitor_id 
      AND auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "Visitors can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = visitor_id::text);

CREATE POLICY "Exhibitors can manage appointments for their slots"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exhibitors e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = appointments.exhibitor_id 
      AND auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "Admins can manage all appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND type = 'admin'
    )
  );