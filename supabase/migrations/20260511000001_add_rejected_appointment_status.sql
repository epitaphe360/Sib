-- Add 'rejected' value to appointment_status enum if it exists
-- If the column is TEXT (not enum), this is a no-op
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'appointment_status'
  ) THEN
    -- Check if 'rejected' is already in the enum
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'appointment_status')
        AND enumlabel = 'rejected'
    ) THEN
      ALTER TYPE appointment_status ADD VALUE 'rejected';
    END IF;
  END IF;
END $$;
