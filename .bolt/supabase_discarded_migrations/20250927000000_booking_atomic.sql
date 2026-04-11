-- Idempotent migration: atomic booking RPC + triggers to maintain time_slots.current_bookings
-- Creates:
--  - function book_time_slot_atomic(visitor_id uuid, time_slot_id uuid, meeting_type meeting_type, message text)
--  - unique index to prevent duplicate visitor bookings for same slot
--  - triggers to keep current_bookings in sync on insert/update/delete

-- Prevent duplicate index creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'appointments_visitor_slot_unique'
  ) THEN
    CREATE UNIQUE INDEX appointments_visitor_slot_unique ON appointments(visitor_id, time_slot_id);
  END IF;
END$$;

-- Drop existing functions/triggers if present (safe to run multiple times)
DROP FUNCTION IF EXISTS book_time_slot_atomic(uuid, uuid, meeting_type, text) CASCADE;
DROP FUNCTION IF EXISTS _adjust_time_slot_bookings() CASCADE;

-- Atomic booking function: locks time_slot row, checks capacity, inserts appointment and updates counters
CREATE OR REPLACE FUNCTION book_time_slot_atomic(
  p_visitor_id uuid,
  p_time_slot_id uuid,
  p_meeting_type meeting_type DEFAULT 'in-person',
  p_message text DEFAULT NULL
) RETURNS appointments AS $$
DECLARE
  ts_row RECORD;
  new_app appointments%ROWTYPE;
BEGIN
  -- Lock the timeslot row to avoid races
  SELECT * INTO ts_row FROM time_slots WHERE id = p_time_slot_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Time slot not found';
  END IF;

  IF ts_row.current_bookings >= ts_row.max_bookings THEN
    RAISE EXCEPTION 'Time slot fully booked';
  END IF;

  -- Insert appointment
  INSERT INTO appointments (exhibitor_id, visitor_id, time_slot_id, status, message, meeting_type)
  VALUES (ts_row.exhibitor_id, p_visitor_id, p_time_slot_id, 'pending'::appointment_status, p_message, p_meeting_type)
  RETURNING * INTO new_app;

  -- Update slot counters
  UPDATE time_slots SET current_bookings = current_bookings + 1, available = (current_bookings + 1 < max_bookings) WHERE id = p_time_slot_id;

  RETURN new_app;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to keep time_slots.current_bookings consistent when appointments change via other flows
CREATE OR REPLACE FUNCTION _adjust_time_slot_bookings() RETURNS trigger AS $$
BEGIN
  -- On INSERT: increment if not cancelled
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status IS NULL OR NEW.status <> 'cancelled') THEN
      UPDATE time_slots SET current_bookings = current_bookings + 1, available = (current_bookings + 1 < max_bookings) WHERE id = NEW.time_slot_id;
    END IF;
    RETURN NEW;
  END IF;

  -- On DELETE: decrement if not cancelled
  IF (TG_OP = 'DELETE') THEN
    IF (OLD.status IS NULL OR OLD.status <> 'cancelled') THEN
      UPDATE time_slots SET current_bookings = GREATEST(0, current_bookings - 1), available = (GREATEST(0, current_bookings - 1) < max_bookings) WHERE id = OLD.time_slot_id;
    END IF;
    RETURN OLD;
  END IF;

  -- On UPDATE: adjust if status changed between cancelled / not cancelled or if time_slot changed
  IF (TG_OP = 'UPDATE') THEN
    -- If time_slot changed, adjust both
    IF (OLD.time_slot_id IS DISTINCT FROM NEW.time_slot_id) THEN
      IF (OLD.status IS NULL OR OLD.status <> 'cancelled') THEN
        UPDATE time_slots SET current_bookings = GREATEST(0, current_bookings - 1), available = (GREATEST(0, current_bookings - 1) < max_bookings) WHERE id = OLD.time_slot_id;
      END IF;
      IF (NEW.status IS NULL OR NEW.status <> 'cancelled') THEN
        UPDATE time_slots SET current_bookings = current_bookings + 1, available = (current_bookings + 1 < max_bookings) WHERE id = NEW.time_slot_id;
      END IF;
      RETURN NEW;
    END IF;

    -- If status changed to cancelled -> decrement
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF (OLD.status IS NULL OR OLD.status <> 'cancelled') AND (NEW.status = 'cancelled') THEN
        UPDATE time_slots SET current_bookings = GREATEST(0, current_bookings - 1), available = (GREATEST(0, current_bookings - 1) < max_bookings) WHERE id = NEW.time_slot_id;
      ELSIF (OLD.status = 'cancelled') AND (NEW.status IS NULL OR NEW.status <> 'cancelled') THEN
        UPDATE time_slots SET current_bookings = current_bookings + 1, available = (current_bookings + 1 < max_bookings) WHERE id = NEW.time_slot_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to appointments for insert/update/delete
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointments_adjust_slot_trigger') THEN
    CREATE TRIGGER appointments_adjust_slot_trigger
      AFTER INSERT OR UPDATE OR DELETE ON appointments
      FOR EACH ROW EXECUTE FUNCTION _adjust_time_slot_bookings();
  END IF;
END$$;

-- Allow exec of RPC by authenticated role
GRANT EXECUTE ON FUNCTION book_time_slot_atomic(uuid, uuid, meeting_type, text) TO authenticated;
