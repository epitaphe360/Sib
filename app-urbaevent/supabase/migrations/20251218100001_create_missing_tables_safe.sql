-- ========================================
-- Create Missing Tables - SAFE VERSION
-- ========================================
-- Date: 2024-12-18
-- Purpose: Add 7 missing tables with safe checks
-- ========================================

-- ========================================
-- 1. PROFILE_VIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profile_views'
    AND policyname = 'Users can view their own profile view stats'
  ) THEN
    CREATE POLICY "Users can view their own profile view stats"
      ON profile_views FOR SELECT
      USING (auth.uid() = viewed_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profile_views'
    AND policyname = 'Users can create profile views'
  ) THEN
    CREATE POLICY "Users can create profile views"
      ON profile_views FOR INSERT
      WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- ========================================
-- 2. DOWNLOADS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('catalog', 'brochure', 'product_sheet', 'minisite', 'document')),
  entity_id uuid NOT NULL,
  file_name text,
  file_type text,
  file_url text,
  downloaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_entity ON downloads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON downloads(downloaded_at);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'downloads'
    AND policyname = 'Users can view their own downloads'
  ) THEN
    CREATE POLICY "Users can view their own downloads"
      ON downloads FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'downloads'
    AND policyname = 'Users can create downloads'
  ) THEN
    CREATE POLICY "Users can create downloads"
      ON downloads FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ========================================
-- 3. MINISITE_VIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS minisite_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid NOT NULL,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  viewer_ip text,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_viewer ON minisite_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_date ON minisite_views(viewed_at);

ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'minisite_views'
    AND policyname = 'Anyone can create minisite views'
  ) THEN
    CREATE POLICY "Anyone can create minisite views"
      ON minisite_views FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 4. ACTIVITIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'profile_view', 'message', 'appointment', 'connection',
    'download', 'minisite_view', 'event_registration',
    'favorite_add', 'favorite_remove', 'badge_scan'
  )),
  description text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activities'
    AND policyname = 'Users can view their own activities'
  ) THEN
    CREATE POLICY "Users can view their own activities"
      ON activities FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activities'
    AND policyname = 'System can create activities'
  ) THEN
    CREATE POLICY "System can create activities"
      ON activities FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 5. NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error',
    'appointment', 'message', 'connection',
    'payment', 'system'
  )),
  entity_type text,
  entity_id uuid,
  read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
      ON notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
      ON notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 6. VISITOR_LEVELS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS visitor_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('free', 'premium', 'vip')),
  name text NOT NULL,
  description text,
  price_monthly numeric DEFAULT 0,
  price_annual numeric DEFAULT 0,
  features jsonb DEFAULT '{}',
  quotas jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default levels only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM visitor_levels) THEN
    INSERT INTO visitor_levels (level, name, description, price_monthly, price_annual, features, quotas, display_order)
    VALUES
      ('free', 'Pass Gratuit', 'Accès de base au salon virtuel', 0, 0,
       '{"appointments": 5, "connections": 10, "minisite_views": true, "chat": true}',
       '{"appointments": 5, "connections_per_day": 10, "favorites": 20}', 1),
      ('premium', 'Pass Premium', 'Accès étendu avec plus de rendez-vous', 29.99, 299.99,
       '{"appointments": 15, "connections": 30, "minisite_views": true, "chat": true, "priority_support": true}',
       '{"appointments": 15, "connections_per_day": 30, "favorites": 50}', 2),
      ('vip', 'Pass VIP', 'Accès illimité avec tous les avantages', 99.99, 999.99,
       '{"appointments": 9999, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true}',
       '{"appointments": 9999, "connections_per_day": 9999, "favorites": 9999}', 3);
  END IF;
END $$;

ALTER TABLE visitor_levels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'visitor_levels'
    AND policyname = 'Anyone can view visitor levels'
  ) THEN
    CREATE POLICY "Anyone can view visitor levels"
      ON visitor_levels FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- ========================================
-- 7. RECOMMENDATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 1),
  reasons jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  is_dismissed boolean DEFAULT false,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommended_user_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(user_id, is_dismissed, is_accepted);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'Users can view their own recommendations'
  ) THEN
    CREATE POLICY "Users can view their own recommendations"
      ON recommendations FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'Users can update their own recommendations'
  ) THEN
    CREATE POLICY "Users can update their own recommendations"
      ON recommendations FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recommendations'
    AND policyname = 'System can create recommendations'
  ) THEN
    CREATE POLICY "System can create recommendations"
      ON recommendations FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- FUNCTIONS (only create if notifications table exists)
-- ========================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
  RETURN v_count;
END;
$$;

COMMENT ON TABLE profile_views IS 'Tracks profile view analytics';
COMMENT ON TABLE downloads IS 'Tracks file/document downloads';
COMMENT ON TABLE minisite_views IS 'Tracks mini-site page views';
COMMENT ON TABLE activities IS 'Activity feed/logs';
COMMENT ON TABLE notifications IS 'User notification system';
COMMENT ON TABLE visitor_levels IS 'Visitor tier configuration';
COMMENT ON TABLE recommendations IS 'AI networking recommendations';
