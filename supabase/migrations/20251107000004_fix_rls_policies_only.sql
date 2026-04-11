-- Migration v4.0: Fix RLS Policies ONLY (tables already exist)
-- Description: Corriger toutes les politiques RLS sans recréer les tables
-- Date: 2025-11-07
-- Version: 4.0 - Politiques seulement

-- ====================
-- STEP 1: DROP ALL EXISTING POLICIES
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
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read all exhibitors data" ON exhibitors;

-- Products
DROP POLICY IF EXISTS "Public can read all products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Exhibitors can create own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can update own products" ON products;
DROP POLICY IF EXISTS "Exhibitors can delete own products" ON products;

-- Partners
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;
DROP POLICY IF EXISTS "Public can read all partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- ====================
-- STEP 2: CREATE NEW POLICIES
-- ====================

-- ===== REGISTRATION_REQUESTS POLICIES =====

-- Allow anonymous users to create registration requests
CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view their own registration requests
CREATE POLICY "Users can view own registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all registration requests
CREATE POLICY "Admins can view all registration requests"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Allow admins to update registration requests (approve/reject)
CREATE POLICY "Admins can update registration requests"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ===== USERS POLICIES =====

-- Allow public user creation during signup
CREATE POLICY "Public can create user during signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ===== MINI_SITES POLICIES =====

-- Exhibitors can create their own mini-site
CREATE POLICY "Exhibitors can insert own mini-site"
ON mini_sites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = mini_sites.exhibitor_id
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
    AND exhibitors.id = mini_sites.exhibitor_id
  )
);

-- Public can read all mini-sites
CREATE POLICY "Public can read all mini-sites"
ON mini_sites
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== TIME_SLOTS POLICIES =====

-- Public can read all time slots
CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create own time slots
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

-- Exhibitors can update own time slots
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
);

-- Exhibitors can delete own time slots
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

-- ===== NEWS_ARTICLES POLICIES =====

-- Public can read all news articles
CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO anon, authenticated
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
    AND users.role = 'admin'
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
    AND users.role = 'admin'
  )
);

-- ===== EXHIBITORS POLICIES =====

-- Public can read all exhibitors
CREATE POLICY "Public can read all exhibitors data"
ON exhibitors
FOR SELECT
TO anon, authenticated
USING (true);

-- ===== PRODUCTS POLICIES =====

-- Public can read all products
CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO anon, authenticated
USING (true);

-- Exhibitors can create products
CREATE POLICY "Exhibitors can create own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can update own products
CREATE POLICY "Exhibitors can update own products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- Exhibitors can delete own products
CREATE POLICY "Exhibitors can delete own products"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.user_id = auth.uid()
    AND exhibitors.id = exhibitor_id
  )
);

-- ===== PARTNERS POLICIES =====

-- Public can read all partners
CREATE POLICY "Anyone can read partners"
ON partners
FOR SELECT
TO anon, authenticated
USING (true);

-- ====================
-- STEP 3: ENSURE RLS IS ENABLED
-- ====================

ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Migration v4.0 completed successfully
