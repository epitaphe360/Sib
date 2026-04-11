-- ========================================
-- Add Missing Foreign Keys and Fix Type Mismatches (SAFE VERSION)
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add referential integrity constraints and fix type inconsistencies
-- ========================================

-- ========================================
-- 1. ADD MISSING FOREIGN KEYS TO EVENTS TABLE
-- ========================================

-- Add foreign key for pavilion_id (safely)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_pavilion_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_pavilion_id_fkey
    FOREIGN KEY (pavilion_id)
    REFERENCES pavilions(id)
    ON DELETE SET NULL;
  ELSE
    -- Drop and recreate to ensure correct definition
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_pavilion_id_fkey;
    ALTER TABLE events
    ADD CONSTRAINT events_pavilion_id_fkey
    FOREIGN KEY (pavilion_id)
    REFERENCES pavilions(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key for organizer_id (safely)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_organizer_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
  ELSE
    -- Drop and recreate to ensure correct definition
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
    ALTER TABLE events
    ADD CONSTRAINT events_organizer_id_fkey
    FOREIGN KEY (organizer_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- ========================================
-- 2. UPDATE VISITOR_LEVEL ENUM (Remove 'basic')
-- ========================================

-- Note: visitor_level in users table should only have: free, premium, vip
-- The TypeScript type was including 'basic' which doesn't exist in DB

-- Verify and update any 'basic' values to 'free' (shouldn't exist but just in case)
DO $$
BEGIN
  UPDATE users
  SET visitor_level = 'free'
  WHERE visitor_level = 'basic';
EXCEPTION WHEN OTHERS THEN
  -- If error (e.g., 'basic' is not a valid value), ignore
  NULL;
END $$;

-- ========================================
-- 3. ADD CONSISTENCY CHECKS
-- ========================================

-- Ensure visitor_profiles.pass_type syncs with users.visitor_level
CREATE OR REPLACE FUNCTION sync_visitor_level_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.visitor_level changes, update visitor_profiles.pass_type
  IF OLD.visitor_level IS DISTINCT FROM NEW.visitor_level THEN
    UPDATE visitor_profiles
    SET pass_type = NEW.visitor_level
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_visitor_level_trigger ON users;
CREATE TRIGGER sync_visitor_level_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.visitor_level IS DISTINCT FROM NEW.visitor_level)
  EXECUTE FUNCTION sync_visitor_level_to_profile();

-- Ensure partner_profiles.partnership_level syncs with users.partner_tier
CREATE OR REPLACE FUNCTION sync_partner_tier_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.partner_tier changes, update partner_profiles.partnership_level
  IF OLD.partner_tier IS DISTINCT FROM NEW.partner_tier THEN
    UPDATE partner_profiles
    SET partnership_level = NEW.partner_tier
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_partner_tier_trigger ON users;
CREATE TRIGGER sync_partner_tier_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.partner_tier IS DISTINCT FROM NEW.partner_tier)
  EXECUTE FUNCTION sync_partner_tier_to_profile();

-- ========================================
-- 4. ADD INDEXES FOR FOREIGN KEYS (Performance)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_events_pavilion ON events(pavilion_id)
  WHERE pavilion_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id)
  WHERE organizer_id IS NOT NULL;

-- ========================================
-- 5. DATA VALIDATION CONSTRAINTS (SAFELY)
-- ========================================

-- Ensure email format is valid (basic check)
DO $$
BEGIN
  ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_email_format_check;

  ALTER TABLE users
  ADD CONSTRAINT users_email_format_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint cannot be added (might have invalid existing data)
  RAISE NOTICE 'Could not add email format constraint - may have invalid existing data';
END $$;

-- Ensure dates are logical for events
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_dates_logical_check;

  ALTER TABLE events
  ADD CONSTRAINT events_dates_logical_check
  CHECK (end_date >= start_date);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events dates constraint - may have invalid existing data';
END $$;

-- Ensure capacity is positive
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_capacity_positive_check;

  ALTER TABLE events
  ADD CONSTRAINT events_capacity_positive_check
  CHECK (capacity IS NULL OR capacity > 0);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events capacity constraint - may have invalid existing data';
END $$;

-- Ensure registered doesn't exceed capacity
DO $$
BEGIN
  ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_registered_valid_check;

  ALTER TABLE events
  ADD CONSTRAINT events_registered_valid_check
  CHECK (
    capacity IS NULL
    OR registered IS NULL
    OR registered <= capacity
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add events registered constraint - may have invalid existing data';
END $$;

-- ========================================
-- 6. ADD HELPER VIEWS FOR COMMON QUERIES
-- ========================================

-- View: Active users with full profile data
CREATE OR REPLACE VIEW active_users_with_profiles AS
SELECT
  u.id,
  u.email,
  u.name,
  u.type,
  u.status,
  u.visitor_level,
  u.partner_tier,
  u.profile,
  CASE
    WHEN u.type = 'visitor' THEN row_to_json(vp.*)
    WHEN u.type = 'partner' THEN row_to_json(pp.*)
    WHEN u.type = 'exhibitor' THEN row_to_json(ep.*)
    ELSE NULL
  END as full_profile,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN visitor_profiles vp ON u.id = vp.user_id
LEFT JOIN partner_profiles pp ON u.id = pp.user_id
LEFT JOIN exhibitor_profiles ep ON u.id = ep.user_id
WHERE u.status = 'active';

-- View: Upcoming events with organizer info
CREATE OR REPLACE VIEW upcoming_events AS
SELECT
  e.*,
  u.name as organizer_name,
  u.email as organizer_email,
  p.name as pavilion_name
FROM events e
LEFT JOIN users u ON e.organizer_id = u.id
LEFT JOIN pavilions p ON e.pavilion_id = p.id
WHERE e.start_date > now()
ORDER BY e.start_date ASC;

-- View: User connection network
CREATE OR REPLACE VIEW user_connections_view AS
SELECT
  c.id,
  c.requester_id,
  c.addressee_id,
  c.status,
  c.created_at,
  u1.name as requester_name,
  u1.email as requester_email,
  u1.type as requester_type,
  u2.name as addressee_name,
  u2.email as addressee_email,
  u2.type as addressee_type
FROM connections c
JOIN users u1 ON c.requester_id = u1.id
JOIN users u2 ON c.addressee_id = u2.id
WHERE c.status = 'accepted';

-- ========================================
-- COMMENTS
-- ========================================

DO $$
BEGIN
  COMMENT ON CONSTRAINT events_pavilion_id_fkey ON events IS 'Events can be associated with a pavilion';
  COMMENT ON CONSTRAINT events_organizer_id_fkey ON events IS 'Events have an organizer (user)';
  COMMENT ON VIEW active_users_with_profiles IS 'Active users with their complete profile data';
  COMMENT ON VIEW upcoming_events IS 'Future events with organizer and pavilion information';
  COMMENT ON VIEW user_connections_view IS 'Accepted connections between users with full details';
EXCEPTION WHEN OTHERS THEN
  -- Ignore comment errors
  NULL;
END $$;

-- ========================================
-- END OF MIGRATION
-- ========================================
