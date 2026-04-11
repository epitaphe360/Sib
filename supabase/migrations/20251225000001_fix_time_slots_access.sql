-- Fix time_slots RLS and accessibility
-- Date: 2025-12-25

-- 1. Ensure time_slots table has all required columns and proper structure
DO $$
BEGIN
  -- Check if exhibitor_id column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'exhibitor_id'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_id ON time_slots(exhibitor_id);
  END IF;

  -- Ensure slot_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'slot_date'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN slot_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Ensure start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN start_time TIME NOT NULL DEFAULT '09:00:00';
  END IF;

  -- Ensure end_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN end_time TIME NOT NULL DEFAULT '10:00:00';
  END IF;

  -- Ensure type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'type'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN type TEXT DEFAULT 'in-person';
  END IF;

  -- Ensure max_bookings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'max_bookings'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN max_bookings INTEGER DEFAULT 1;
  END IF;

  -- Ensure current_bookings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'current_bookings'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN current_bookings INTEGER DEFAULT 0;
  END IF;

  -- Ensure available column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'available'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN available BOOLEAN DEFAULT true;
  END IF;

  -- Ensure location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'location'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN location TEXT;
  END IF;

  -- Ensure duration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'duration'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN duration INTEGER;
  END IF;

  -- Ensure updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

END $$;

-- 2. Enable RLS on time_slots if not already enabled
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;

-- 4. Create new RLS policies for time_slots
-- Allow everyone to read all time slots
CREATE POLICY "Public can read all time slots" ON time_slots
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (exhibitors) to create time slots
CREATE POLICY "Authenticated users can create time slots" ON time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update any time slots (admin/exhibitor management)
CREATE POLICY "Authenticated users can update time slots" ON time_slots
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete time slots
CREATE POLICY "Authenticated users can delete time slots" ON time_slots
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_id ON time_slots(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_slot_date ON time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(available);
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_date ON time_slots(exhibitor_id, slot_date);

-- 6. Add comment for documentation
COMMENT ON TABLE time_slots IS 'Table for storing exhibitor meeting time slots';
COMMENT ON COLUMN time_slots.exhibitor_id IS 'Reference to the exhibitor offering this time slot';
COMMENT ON COLUMN time_slots.slot_date IS 'Date of the time slot';
COMMENT ON COLUMN time_slots.start_time IS 'Start time of the slot';
COMMENT ON COLUMN time_slots.end_time IS 'End time of the slot';
COMMENT ON COLUMN time_slots.available IS 'Whether the slot is available for booking';
