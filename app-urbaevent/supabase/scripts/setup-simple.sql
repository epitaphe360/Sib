-- =====================================================
-- MINI-SITE BUILDER & NETWORKING MATCHMAKING
-- Configuration BASE (Sans vues - Version simplifiée)
-- =====================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES MINI-SITE BUILDER
-- =====================================================

-- Table: mini_sites
CREATE TABLE IF NOT EXISTS mini_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sections JSONB DEFAULT '[]'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mini_sites_exhibitor ON mini_sites(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sites_slug ON mini_sites(slug);
CREATE INDEX IF NOT EXISTS idx_mini_sites_published ON mini_sites(published);

-- Table: site_templates
CREATE TABLE IF NOT EXISTS site_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail TEXT,
  sections JSONB NOT NULL,
  premium BOOLEAN DEFAULT false,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_templates_category ON site_templates(category);
CREATE INDEX IF NOT EXISTS idx_site_templates_popularity ON site_templates(popularity DESC);

-- Table: site_images
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_exhibitor ON site_images(exhibitor_id);

-- =====================================================
-- 2. TABLES NETWORKING & MATCHMAKING
-- =====================================================

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT,
  role TEXT,
  industry TEXT,
  interests TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  offering TEXT[] DEFAULT '{}',
  location TEXT,
  linkedin TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_industry ON user_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_user_profiles_interests ON user_profiles USING GIN(interests);

-- Table: networking_interactions
CREATE TABLE IF NOT EXISTS networking_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('view', 'like', 'message', 'meeting', 'connection')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_networking_from_user ON networking_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_to_user ON networking_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_type ON networking_interactions(type);
CREATE INDEX IF NOT EXISTS idx_networking_timestamp ON networking_interactions(timestamp DESC);

-- Table: match_scores
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score_boost INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_user1 ON match_scores(user_id_1);
CREATE INDEX IF NOT EXISTS idx_match_scores_user2 ON match_scores(user_id_2);

-- Table: speed_networking_sessions
CREATE TABLE IF NOT EXISTS speed_networking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  max_participants INTEGER DEFAULT 20,
  participants UUID[] DEFAULT '{}',
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed')) DEFAULT 'scheduled',
  matches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speed_networking_event ON speed_networking_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_speed_networking_status ON speed_networking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_speed_networking_start_time ON speed_networking_sessions(start_time);

-- Table: networking_rooms
CREATE TABLE IF NOT EXISTS networking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 50,
  participants UUID[] DEFAULT '{}',
  moderator TEXT,
  status TEXT CHECK (status IN ('open', 'full', 'closed')) DEFAULT 'open',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_networking_rooms_event ON networking_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_sector ON networking_rooms(sector);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_status ON networking_rooms(status);

-- =====================================================
-- 3. STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_networking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_rooms ENABLE ROW LEVEL SECURITY;

-- POLICIES: mini_sites
DROP POLICY IF EXISTS "Public can view published mini sites" ON mini_sites;
CREATE POLICY "Public can view published mini sites"
ON mini_sites FOR SELECT
USING (published = true);

DROP POLICY IF EXISTS "Exhibitors can view own mini sites" ON mini_sites;
CREATE POLICY "Exhibitors can view own mini sites"
ON mini_sites FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

DROP POLICY IF EXISTS "Exhibitors can create own mini sites" ON mini_sites;
CREATE POLICY "Exhibitors can create own mini sites"
ON mini_sites FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

DROP POLICY IF EXISTS "Exhibitors can update own mini sites" ON mini_sites;
CREATE POLICY "Exhibitors can update own mini sites"
ON mini_sites FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

DROP POLICY IF EXISTS "Exhibitors can delete own mini sites" ON mini_sites;
CREATE POLICY "Exhibitors can delete own mini sites"
ON mini_sites FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

-- POLICIES: site_templates
DROP POLICY IF EXISTS "Anyone can view templates" ON site_templates;
CREATE POLICY "Anyone can view templates"
ON site_templates FOR SELECT
TO authenticated
USING (true);

-- POLICIES: site_images
DROP POLICY IF EXISTS "Exhibitors can view own images" ON site_images;
CREATE POLICY "Exhibitors can view own images"
ON site_images FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

DROP POLICY IF EXISTS "Exhibitors can upload images" ON site_images;
CREATE POLICY "Exhibitors can upload images"
ON site_images FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

DROP POLICY IF EXISTS "Exhibitors can delete own images" ON site_images;
CREATE POLICY "Exhibitors can delete own images"
ON site_images FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = exhibitor_id));

-- POLICIES: user_profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON user_profiles;
CREATE POLICY "Anyone can view profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
CREATE POLICY "Users can create own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- POLICIES: networking_interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON networking_interactions;
CREATE POLICY "Users can view own interactions"
ON networking_interactions FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id = from_user_id OR id = to_user_id
  )
);

DROP POLICY IF EXISTS "Users can create interactions" ON networking_interactions;
CREATE POLICY "Users can create interactions"
ON networking_interactions FOR INSERT
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = from_user_id)
);

-- POLICIES: match_scores
DROP POLICY IF EXISTS "Users can view own match scores" ON match_scores;
CREATE POLICY "Users can view own match scores"
ON match_scores FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id = user_id_1 OR id = user_id_2
  )
);

DROP POLICY IF EXISTS "System can manage match scores" ON match_scores;
CREATE POLICY "System can manage match scores"
ON match_scores FOR ALL
USING (true)
WITH CHECK (true);

-- POLICIES: speed_networking_sessions
DROP POLICY IF EXISTS "Anyone can view sessions" ON speed_networking_sessions;
CREATE POLICY "Anyone can view sessions"
ON speed_networking_sessions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can create sessions" ON speed_networking_sessions;
CREATE POLICY "Admins can create sessions"
ON speed_networking_sessions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'organizer')
  )
);

DROP POLICY IF EXISTS "Admins can update sessions" ON speed_networking_sessions;
CREATE POLICY "Admins can update sessions"
ON speed_networking_sessions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'organizer')
  )
);

-- POLICIES: networking_rooms
DROP POLICY IF EXISTS "Anyone can view open rooms" ON networking_rooms;
CREATE POLICY "Anyone can view open rooms"
ON networking_rooms FOR SELECT
TO authenticated
USING (status IN ('open', 'full'));

DROP POLICY IF EXISTS "Admins can create rooms" ON networking_rooms;
CREATE POLICY "Admins can create rooms"
ON networking_rooms FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'organizer')
  )
);

DROP POLICY IF EXISTS "Admins can update rooms" ON networking_rooms;
CREATE POLICY "Admins can update rooms"
ON networking_rooms FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'organizer')
  )
);

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public read access for site images" ON storage.objects;
CREATE POLICY "Public read access for site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Authenticated users can upload site images" ON storage.objects;
CREATE POLICY "Authenticated users can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own site images" ON storage.objects;
CREATE POLICY "Users can delete own site images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mini_sites_updated_at ON mini_sites;
CREATE TRIGGER update_mini_sites_updated_at
  BEFORE UPDATE ON mini_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_scores_updated_at ON match_scores;
CREATE TRIGGER update_match_scores_updated_at
  BEFORE UPDATE ON match_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Configuration simplifiée terminée !';
  RAISE NOTICE '📦 8 tables créées';
  RAISE NOTICE '🔐 RLS policies configurées';
  RAISE NOTICE '📁 Storage bucket créé';
  RAISE NOTICE '🚀 Prêt pour le seeding';
END $$;
