-- Tables manquantes pour l'app Flutter SIB
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- ──────────────────────────────────────────────────────────
-- 1. Table notifications (in-app)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  salon_id UUID REFERENCES salons(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read notifications"
  ON notifications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────
-- 2. Table business_sectors
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_sectors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read business_sectors"
  ON business_sectors FOR SELECT TO authenticated
  USING (true);

-- ──────────────────────────────────────────────────────────
-- 3. Table gates (contrôle d'accès agents)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  salon_id UUID REFERENCES salons(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read gates"
  ON gates FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage gates"
  ON gates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────
-- 4. Table apple_social_data
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS apple_social_data (
  id SERIAL PRIMARY KEY,
  social_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE apple_social_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read own apple data"
  ON apple_social_data FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert apple data"
  ON apple_social_data FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update apple data"
  ON apple_social_data FOR UPDATE TO authenticated
  USING (true);

-- ──────────────────────────────────────────────────────────
-- 5. Ajouter last_notification_index aux users si absent
-- ──────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_notification_index INTEGER DEFAULT 0;
