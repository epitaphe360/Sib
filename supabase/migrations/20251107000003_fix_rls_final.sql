-- Migration Complète v3.0: Fix ALL API Errors - FINAL
-- Description: Créer les tables manquantes ET corriger toutes les politiques RLS
-- Date: 2025-11-07
-- Version: 3.0 - Correction des colonnes (exhibitor_id au lieu de user_id pour time_slots)

-- ====================
-- STEP 1: CREATE ENUMS
-- ====================

-- Create user_type enum if not exists
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('exhibitor', 'partner', 'visitor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_status enum if not exists
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================
-- STEP 2: CREATE TABLES
-- ====================

-- Create registration_requests table if not exists
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  position text,
  phone text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  rejection_reason text
);

-- Create indexes for registration_requests
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_id ON registration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_created_at ON registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registration_requests_user_type ON registration_requests(user_type);

-- Enable RLS on registration_requests
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- ====================
-- STEP 3: DROP OLD POLICIES
-- ====================

-- Registration Requests
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Public can view pending registration requests count" ON registration_requests;
DROP POLICY IF EXISTS "Users can view own registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Admins can update registration requests" ON registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert own registration requests" ON registration_requests;

-- Users
DROP POLICY IF EXISTS "Public can create user during signup" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;

-- Mini Sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read all mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites from verified exhibitors" ON mini_sites;

-- Time Slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can create own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can update own time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can delete own time slots" ON time_slots;

-- News Articles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;
DROP POLICY IF EXISTS "Public can read all news articles" ON news_articles;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

-- Exhibitors
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read products from verified exhibitors" ON products;
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Public can read partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 4: CREATE NEW POLICIES
-- ====================

-- ========== REGISTRATION_REQUESTS ==========

-- Allow public to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to view pending registration requests count
CREATE POLICY "Public can view pending registration requests count"
ON registration_requests
FOR SELECT
TO public
USING (status = 'pending');

-- Users can view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== USERS ==========

-- Allow user creation during signup (public access)
CREATE POLICY "Allow user creation during signup"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- ========== MINI_SITES ==========

-- Exhibitors can insert their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update their own mini-site
CREATE POLICY "Exhibitors can update own mini-site"
ON mini_sites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO public
USING (true);

-- ========== TIME_SLOTS ==========
-- NOTE: time_slots uses exhibitor_id, not user_id

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO public
USING (true);

-- Exhibitors can create their own time slots
CREATE POLICY "Exhibitors can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update their own time slots
CREATE POLICY "Exhibitors can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete their own time slots
CREATE POLICY "Exhibitors can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ========== NEWS_ARTICLES ==========

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Admins can create news articles
CREATE POLICY "Admins can create news articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- Admins can update news articles
CREATE POLICY "Admins can update news articles"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'admin'
  )
);

-- ========== EXHIBITORS ==========

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors"
ON exhibitors
FOR SELECT
TO public
USING (true);

-- ========== PRODUCTS ==========

-- Public can read all products
CREATE POLICY "Public can read all products"
ON products
FOR SELECT
TO public
USING (true);

-- ========== PARTNERS ==========

-- Public can read all partners
CREATE POLICY "Public can read all partners"
ON partners
FOR SELECT
TO public
USING (true);

-- ====================
-- STEP 5: COMMENTS
-- ====================

COMMENT ON POLICY "Public can create registration requests" ON registration_requests
  IS 'Permet au public de créer des demandes d''inscription';
COMMENT ON POLICY "Public can view pending registration requests count" ON registration_requests
  IS 'Permet au public de voir les demandes en attente';
COMMENT ON POLICY "Allow user creation during signup" ON users
  IS 'Permet la création d''utilisateurs durant l''inscription';
COMMENT ON POLICY "Exhibitors can insert own mini-site" ON mini_sites
  IS 'Permet aux exposants de créer leur mini-site';
COMMENT ON POLICY "Exhibitors can update own mini-site" ON mini_sites
  IS 'Permet aux exposants de modifier leur mini-site';
COMMENT ON POLICY "Public can read time slots" ON time_slots
  IS 'Permet au public de lire tous les créneaux horaires';
COMMENT ON POLICY "Exhibitors can create own time slots" ON time_slots
  IS 'Permet aux exposants de créer leurs créneaux';
COMMENT ON POLICY "Exhibitors can update own time slots" ON time_slots
  IS 'Permet aux exposants de modifier leurs créneaux';
COMMENT ON POLICY "Exhibitors can delete own time slots" ON time_slots
  IS 'Permet aux exposants de supprimer leurs créneaux';
COMMENT ON POLICY "Public can read all news articles" ON news_articles
  IS 'Permet au public de lire tous les articles';
COMMENT ON POLICY "Public can read all exhibitors" ON exhibitors
  IS 'Permet au public de lire tous les exposants';
COMMENT ON POLICY "Public can read all products" ON products
  IS 'Permet au public de lire tous les produits';
COMMENT ON POLICY "Public can read all partners" ON partners
  IS 'Permet au public de lire tous les partenaires';

-- ====================
-- VERIFICATION
-- ====================

-- Display all policies for verification
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles::text[],
    cmd,
    CASE
      WHEN length(qual) > 50 THEN substring(qual from 1 for 47) || '...'
      ELSE qual
    END as qual_short
FROM pg_policies
WHERE tablename IN ('registration_requests', 'users', 'mini_sites', 'time_slots', 'news_articles', 'exhibitors', 'products', 'partners')
ORDER BY tablename, policyname;
