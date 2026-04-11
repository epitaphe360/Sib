-- =====================================================
-- SCRIPT DE MIGRATION INTELLIGENT
-- Ajoute UNIQUEMENT ce qui manque, ne supprime RIEN
-- =====================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper: retourne le nom réel de la table de profils (profiles ou profils), crée une table "profiles" minimale seulement si les deux manquent
CREATE OR REPLACE FUNCTION get_profile_table() RETURNS text AS $$
DECLARE
  t text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    t := 'profiles';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profils') THEN
    t := 'profils';
  ELSE
    -- Aucune table de profil existante : créer une table minimale "profiles" pour compatibilité
    EXECUTE 'CREATE TABLE profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      company TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )';
    t := 'profiles';
    RAISE NOTICE '✅ Table profiles créée (minimale)';
  END IF;
  RETURN t;
END;
$$ LANGUAGE plpgsql;

-- Table de secours: admin_users (si la colonne 'role' n'existe pas, on peut y ajouter des admins)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
    CREATE TABLE admin_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE '✅ Table admin_users créée (fallback pour vérif roles)';
  ELSE
    RAISE NOTICE 'ℹ️ Table admin_users existante, aucune action';
  END IF;
END $$;


-- =====================================================
-- ÉTAPE 1: CRÉER OU MODIFIER LES TABLES
-- =====================================================

-- Table: mini_sites (créer si n'existe pas, sinon ajouter colonnes manquantes)
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS mini_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exhibitor_id UUID REFERENCES %I(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )', p_table);
END $$;

-- Ajouter les colonnes manquantes à mini_sites
DO $$ 
BEGIN
  -- Ajouter slug si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'slug'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN slug TEXT;
    -- Générer des slugs pour les lignes existantes
    UPDATE mini_sites SET slug = id::text WHERE slug IS NULL;
    -- Rendre la colonne unique et NOT NULL après remplissage
    ALTER TABLE mini_sites ALTER COLUMN slug SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mini_sites_slug_unique ON mini_sites(slug);
    RAISE NOTICE '✅ Colonne slug ajoutée à mini_sites';
  END IF;

  -- Ajouter sections si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'sections'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN sections JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ Colonne sections ajoutée à mini_sites';
  END IF;

  -- Ajouter seo si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'seo'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN seo JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Colonne seo ajoutée à mini_sites';
  END IF;

  -- Ajouter published si n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mini_sites' AND column_name = 'published'
  ) THEN
    ALTER TABLE mini_sites ADD COLUMN published BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Colonne published ajoutée à mini_sites';
  END IF;
END $$;

-- Index pour mini_sites
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
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS site_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exhibitor_id UUID REFERENCES %I(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )', p_table);
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_site_images_exhibitor ON site_images(exhibitor_id)';
END $$;

-- Table: user_profiles (utilise la table réelle de profils -> profiles ou profils) et ajoute colonnes manquantes
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ''{}''', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT ''{}''', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS offering TEXT[] DEFAULT ''{}''', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS linkedin TEXT', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS bio TEXT', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS industry TEXT', p_table);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS location TEXT', p_table);
  RAISE NOTICE '✅ Colonnes networking ajoutées à %', p_table;
END $$;

-- Index sur la table de profils (création dynamique selon nom réel)
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_industry ON %I(industry)', p_table, p_table);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_interests ON %I USING GIN(interests)', p_table, p_table);
END $$;

-- Table: networking_interactions
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS networking_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES %I(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES %I(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT ''{}''::jsonb
  )', p_table, p_table);
END $$;

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'networking_interactions_type_check'
  ) THEN
    ALTER TABLE networking_interactions 
    ADD CONSTRAINT networking_interactions_type_check 
    CHECK (type IN ('view', 'like', 'message', 'meeting', 'connection'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur networking_interactions.type';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_networking_from_user ON networking_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_to_user ON networking_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_networking_type ON networking_interactions(type);
CREATE INDEX IF NOT EXISTS idx_networking_timestamp ON networking_interactions(timestamp DESC);

-- Table: match_scores
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS match_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID REFERENCES %I(id) ON DELETE CASCADE,
    user_id_2 UUID REFERENCES %I(id) ON DELETE CASCADE,
    score_boost INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )', p_table, p_table);
END $$;

-- Ajouter la contrainte UNIQUE si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'match_scores_user_id_1_user_id_2_key'
  ) THEN
    ALTER TABLE match_scores ADD CONSTRAINT match_scores_user_id_1_user_id_2_key UNIQUE (user_id_1, user_id_2);
    RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur match_scores';
  END IF;
END $$;

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
  status TEXT DEFAULT 'scheduled',
  matches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'speed_networking_sessions_status_check'
  ) THEN
    ALTER TABLE speed_networking_sessions 
    ADD CONSTRAINT speed_networking_sessions_status_check 
    CHECK (status IN ('scheduled', 'active', 'completed'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur speed_networking_sessions.status';
  END IF;
END $$;

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
  status TEXT DEFAULT 'open',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte CHECK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'networking_rooms_status_check'
  ) THEN
    ALTER TABLE networking_rooms 
    ADD CONSTRAINT networking_rooms_status_check 
    CHECK (status IN ('open', 'full', 'closed'));
    RAISE NOTICE '✅ Contrainte CHECK ajoutée sur networking_rooms.status';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_networking_rooms_event ON networking_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_sector ON networking_rooms(sector);
CREATE INDEX IF NOT EXISTS idx_networking_rooms_status ON networking_rooms(status);

-- =====================================================
-- ÉTAPE 2: STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- =====================================================
-- ÉTAPE 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_networking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_rooms ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour créer une policy si elle n'existe pas
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
  p_table_name text,
  p_policy_name text,
  p_command text,
  p_using text DEFAULT NULL,
  p_with_check text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = p_table_name AND policyname = p_policy_name
  ) THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR %s USING (%s)',
      p_policy_name, p_table_name, p_command, p_using);
    IF p_with_check IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR %s WITH CHECK (%s)',
        p_policy_name, p_table_name, p_command, p_with_check);
    END IF;
    RAISE NOTICE '✅ Policy % créée sur %', p_policy_name, p_table_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- POLICIES: mini_sites
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  PERFORM create_policy_if_not_exists(
    'mini_sites',
    'Public can view published mini sites',
    'SELECT',
    'published = true'
  );

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can view own mini sites') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can view own mini sites', 'mini_sites', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can create own mini sites') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can create own mini sites', 'mini_sites', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can update own mini sites') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can update own mini sites', 'mini_sites', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can delete own mini sites') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can delete own mini sites', 'mini_sites', p_table);
  END IF;
END $$;

-- POLICIES: site_templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_templates' AND policyname = 'Anyone can view templates') THEN
    CREATE POLICY "Anyone can view templates" ON site_templates FOR SELECT
    TO authenticated USING (true);
  END IF;
END $$;

-- POLICIES: site_images
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can view own images') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can view own images', 'site_images', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can upload images') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can upload images', 'site_images', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Exhibitors can delete own images') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = exhibitor_id))',
      'Exhibitors can delete own images', 'site_images', p_table);
  END IF;
END $$;

-- POLICIES: profiles (table existante, nom détecté dynamiquement)
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table);

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = 'Anyone can view profiles') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)', 'Anyone can view profiles', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = 'Users can create own profile') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', 'Users can create own profile', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = 'Users can update own profile') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (auth.uid() = user_id)', 'Users can update own profile', p_table);
  END IF;
END $$;

-- POLICIES: networking_interactions
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_interactions' AND policyname = 'Users can view own interactions') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = from_user_id OR id = to_user_id))',
      'Users can view own interactions', 'networking_interactions', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_interactions' AND policyname = 'Users can create interactions') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM %I WHERE id = from_user_id))',
      'Users can create interactions', 'networking_interactions', p_table);
  END IF;
END $$;

-- POLICIES: match_scores
DO $$
DECLARE p_table text := get_profile_table();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_scores' AND policyname = 'Users can view own match scores') THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() IN (SELECT user_id FROM %I WHERE id = user_id_1 OR id = user_id_2))',
      'Users can view own match scores', 'match_scores', p_table);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_scores' AND policyname = 'System can manage match scores') THEN
    CREATE POLICY "System can manage match scores" ON match_scores FOR ALL
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- POLICIES: speed_networking_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Anyone can view sessions') THEN
    CREATE POLICY "Anyone can view sessions" ON speed_networking_sessions FOR SELECT
    TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Admins can create sessions') THEN
    DO $$
    DECLARE p_table text := get_profile_table(); role_exists boolean;
    BEGIN
      SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = p_table AND column_name = 'role') INTO role_exists;
      IF role_exists THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM %I WHERE user_id = auth.uid() AND role IN (''admin'', ''organizer'')))', 'Admins can create sessions', 'speed_networking_sessions', p_table);
      ELSE
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))', 'Admins can create sessions', 'speed_networking_sessions');
      END IF;
    END $$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'speed_networking_sessions' AND policyname = 'Admins can update sessions') THEN
    DO $$
    DECLARE p_table text := get_profile_table(); role_exists boolean;
    BEGIN
      SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = p_table AND column_name = 'role') INTO role_exists;
      IF role_exists THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM %I WHERE user_id = auth.uid() AND role IN (''admin'', ''organizer'')))', 'Admins can update sessions', 'speed_networking_sessions', p_table);
      ELSE
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))', 'Admins can update sessions', 'speed_networking_sessions');
      END IF;
    END $$;
  END IF;
END $$;

-- POLICIES: networking_rooms
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Anyone can view open rooms') THEN
    CREATE POLICY "Anyone can view open rooms" ON networking_rooms FOR SELECT
    TO authenticated USING (status IN ('open', 'full'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Admins can create rooms') THEN
    DO $$
    DECLARE p_table text := get_profile_table(); role_exists boolean;
    BEGIN
      SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = p_table AND column_name = 'role') INTO role_exists;
      IF role_exists THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM %I WHERE user_id = auth.uid() AND role IN (''admin'', ''organizer'')))', 'Admins can create rooms', 'networking_rooms', p_table);
      ELSE
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))', 'Admins can create rooms', 'networking_rooms');
      END IF;
    END $$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'networking_rooms' AND policyname = 'Admins can update rooms') THEN
    DO $$
    DECLARE p_table text := get_profile_table(); role_exists boolean;
    BEGIN
      SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = p_table AND column_name = 'role') INTO role_exists;
      IF role_exists THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM %I WHERE user_id = auth.uid() AND role IN (''admin'', ''organizer'')))', 'Admins can update rooms', 'networking_rooms', p_table);
      ELSE
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))', 'Admins can update rooms', 'networking_rooms');
      END IF;
    END $$;
  END IF;
END $$;

-- STORAGE POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read access for site images') THEN
    CREATE POLICY "Public read access for site images" ON storage.objects FOR SELECT
    USING (bucket_id = 'site-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload site images') THEN
    CREATE POLICY "Authenticated users can upload site images" ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'site-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can delete own site images') THEN
    CREATE POLICY "Users can delete own site images" ON storage.objects FOR DELETE
    TO authenticated USING (bucket_id = 'site-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 4: FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers s'ils n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mini_sites_updated_at') THEN
    CREATE TRIGGER update_mini_sites_updated_at
      BEFORE UPDATE ON mini_sites
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_mini_sites_updated_at créé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_profiles_updated_at créé';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_scores_updated_at') THEN
    CREATE TRIGGER update_match_scores_updated_at
      BEFORE UPDATE ON match_scores
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Trigger update_match_scores_updated_at créé';
  END IF;
END $$;

-- =====================================================
-- MIGRATION TERMINÉE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ MIGRATION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '================================================';
  RAISE NOTICE '📦 Tables vérifiées/créées :';
  RAISE NOTICE '   ✓ mini_sites (colonnes manquantes ajoutées)';
  RAISE NOTICE '   ✓ site_templates';
  RAISE NOTICE '   ✓ site_images';
  RAISE NOTICE '   ✓ profiles (colonnes networking ajoutées)';
  RAISE NOTICE '   ✓ networking_interactions';
  RAISE NOTICE '   ✓ match_scores';
  RAISE NOTICE '   ✓ speed_networking_sessions';
  RAISE NOTICE '   ✓ networking_rooms';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS policies ajoutées (si manquantes)';
  RAISE NOTICE '📁 Storage bucket configuré';
  RAISE NOTICE '⚡ Index et triggers créés';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  AUCUNE DONNÉE SUPPRIMÉE !';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Prochaine étape : npm run seed:templates';
  RAISE NOTICE '================================================';
END $$;
