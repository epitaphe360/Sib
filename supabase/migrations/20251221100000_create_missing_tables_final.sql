/*
  # Create Missing Tables - Final Fix
  
  1. Creates `favorites` table (alias for user_favorites compatibility)
  2. Creates `salon_config` table for salon global configuration
  3. Creates `notifications` table if not exists
  4. Creates `downloads` table if not exists
  5. Creates `recommendations` table if not exists
*/

-- =====================================================
-- 1. FAVORITES TABLE (for visitor favorites)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(visitor_id, exhibitor_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = visitor_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = visitor_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = visitor_id);

CREATE INDEX IF NOT EXISTS idx_favorites_visitor_id ON favorites(visitor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_exhibitor_id ON favorites(exhibitor_id);

-- =====================================================
-- 2. SALON_CONFIG TABLE (global salon configuration)
-- =====================================================
CREATE TABLE IF NOT EXISTS salon_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'SIPORTS 2026',
  edition text DEFAULT '2026',
  start_date timestamptz DEFAULT '2026-06-15T09:00:00Z',
  end_date timestamptz DEFAULT '2026-06-18T18:00:00Z',
  location text DEFAULT 'Casablanca, Maroc',
  venue text DEFAULT 'Palais des Expositions - SAFEX',
  description text DEFAULT 'Salon International des Ports',
  logo_url text,
  banner_url text,
  website_url text DEFAULT 'https://siports.dz',
  contact_email text DEFAULT 'contact@siports.dz',
  contact_phone text,
  social_links jsonb DEFAULT '{}',
  features jsonb DEFAULT '{"networking": true, "appointments": true, "chat": true, "events": true}',
  theme_colors jsonb DEFAULT '{"primary": "#2563eb", "secondary": "#1e40af"}',
  registration_open boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salon_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read salon config" ON salon_config;
CREATE POLICY "Anyone can read salon config" ON salon_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage salon config" ON salon_config;
CREATE POLICY "Admin can manage salon config" ON salon_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- Insert default salon config if not exists
INSERT INTO salon_config (name, edition, description)
SELECT 'SIPORTS 2026', '2026', 'Salon International des Ports - Maroc'
WHERE NOT EXISTS (SELECT 1 FROM salon_config LIMIT 1);

-- =====================================================
-- 3. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  category text DEFAULT 'general',
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 4. DOWNLOADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  resource_name text NOT NULL,
  file_url text,
  file_size bigint,
  download_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  last_downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON downloads;
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;
CREATE POLICY "Users can insert own downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);

-- =====================================================
-- 5. RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommended_type text NOT NULL,
  recommended_id uuid NOT NULL,
  score numeric(5,2) DEFAULT 0,
  reason text,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
CREATE POLICY "Users can view own recommendations" ON recommendations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
CREATE POLICY "Users can update own recommendations" ON recommendations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage recommendations" ON recommendations;
CREATE POLICY "System can manage recommendations" ON recommendations
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);

-- =====================================================
-- 6. ACTIVITIES TABLE (user activity log)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activities" ON activities;
CREATE POLICY "System can insert activities" ON activities
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- =====================================================
-- 7. PROFILE_VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  viewed_id uuid REFERENCES users(id) ON DELETE CASCADE,
  view_count integer DEFAULT 1,
  first_viewed_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz DEFAULT now(),
  UNIQUE(viewer_id, viewed_id)
);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view profile views" ON profile_views;
CREATE POLICY "Users can view profile views" ON profile_views
  FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_id);

DROP POLICY IF EXISTS "Users can insert profile views" ON profile_views;
CREATE POLICY "Users can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Users can update profile views" ON profile_views;
CREATE POLICY "Users can update profile views" ON profile_views
  FOR UPDATE USING (auth.uid() = viewer_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);

-- =====================================================
-- 8. MINISITE_VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS minisite_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minisite_id uuid,
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  view_date date DEFAULT CURRENT_DATE,
  view_count integer DEFAULT 1,
  source text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(minisite_id, viewer_id, view_date)
);

ALTER TABLE minisite_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view minisite stats" ON minisite_views;
CREATE POLICY "Anyone can view minisite stats" ON minisite_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert minisite views" ON minisite_views;
CREATE POLICY "Anyone can insert minisite views" ON minisite_views
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_minisite_views_exhibitor_id ON minisite_views(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_minisite_views_view_date ON minisite_views(view_date);

-- =====================================================
-- 9. QUOTA_USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quota_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quota_type text NOT NULL,
  used integer DEFAULT 0,
  max_allowed integer DEFAULT 100,
  period_start timestamptz DEFAULT now(),
  period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quota_type)
);

ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quota" ON quota_usage;
CREATE POLICY "Users can view own quota" ON quota_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage quota" ON quota_usage;
CREATE POLICY "System can manage quota" ON quota_usage
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_quota_usage_user_id ON quota_usage(user_id);

-- =====================================================
-- 10. MINI_SITES TABLE (exhibitor minisites)
-- =====================================================
CREATE TABLE IF NOT EXISTS mini_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  theme jsonb DEFAULT '{}',
  sections jsonb DEFAULT '[]',
  contact_info jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published minisites" ON mini_sites;
CREATE POLICY "Anyone can view published minisites" ON mini_sites
  FOR SELECT USING (is_published = true OR auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "Exhibitors can manage own minisite" ON mini_sites;
CREATE POLICY "Exhibitors can manage own minisite" ON mini_sites
  FOR ALL USING (auth.uid() = exhibitor_id);

CREATE INDEX IF NOT EXISTS idx_mini_sites_exhibitor_id ON mini_sites(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sites_slug ON mini_sites(slug);

-- =====================================================
-- 11. LEADS TABLE (business leads for exhibitors)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visitor_name text,
  visitor_email text,
  visitor_company text,
  visitor_phone text,
  source text DEFAULT 'salon',
  status text DEFAULT 'new',
  score integer DEFAULT 0,
  notes text,
  tags text[] DEFAULT '{}',
  contacted_at timestamptz,
  converted_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exhibitors can view own leads" ON leads;
CREATE POLICY "Exhibitors can view own leads" ON leads
  FOR SELECT USING (auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "Exhibitors can manage own leads" ON leads;
CREATE POLICY "Exhibitors can manage own leads" ON leads
  FOR ALL USING (auth.uid() = exhibitor_id);

DROP POLICY IF EXISTS "System can insert leads" ON leads;
CREATE POLICY "System can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_exhibitor_id ON leads(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
