-- Migration: Fix RLS Policies - Remove Overly Permissive Policies
-- Description: Corriger les politiques RLS qui permettent un accès trop large
-- Date: 2025-10-30

-- ====================
-- NEWS ARTICLES POLICIES
-- ====================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read published news" ON news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON news_articles;

-- Create correct policy: only published articles
CREATE POLICY "Public can read published news only"
ON news_articles
FOR SELECT
TO public
USING (published = true);

-- ====================
-- EXHIBITORS POLICIES
-- ====================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;

-- Create correct policy: only verified exhibitors
CREATE POLICY "Public can read verified exhibitors only"
ON exhibitors
FOR SELECT
TO public
USING (verified = true);

-- ====================
-- PRODUCTS POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Create correct policy: products from verified exhibitors only
CREATE POLICY "Public can read products from verified exhibitors"
ON products
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.id = products.exhibitor_id
    AND exhibitors.verified = true
  )
);

-- ====================
-- MINI_SITES POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;

-- Create correct policy: only published mini-sites from verified exhibitors
CREATE POLICY "Public can read published mini-sites from verified exhibitors"
ON mini_sites
FOR SELECT
TO public
USING (
  published = true
  AND EXISTS (
    SELECT 1 FROM exhibitors
    WHERE exhibitors.id = mini_sites.exhibitor_id
    AND exhibitors.verified = true
  )
);

-- ====================
-- PARTNERS POLICIES
-- ====================
-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can read partners" ON partners;
DROP POLICY IF EXISTS "Anyone can read partners" ON partners;

-- Create correct policy: only verified partners
CREATE POLICY "Public can read verified partners only"
ON partners
FOR SELECT
TO public
USING (verified = true);

-- ====================
-- EVENTS POLICIES
-- ====================
-- Ensure events are only public if featured or published
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;

-- Create correct policy: only featured/published events
CREATE POLICY "Public can read featured events only"
ON events
FOR SELECT
TO public
USING (
  featured = true
  OR (start_time > NOW() AND capacity > registered)
);

-- ====================
-- USERS PROFILES POLICIES
-- ====================
-- Ensure users table doesn't expose sensitive data
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;

-- Users can only read their own data or public profiles
CREATE POLICY "Users can read own data or public profiles"
ON users
FOR SELECT
USING (
  auth.uid() = id -- Own data
  OR status = 'active' -- Only active users' public info
);

-- ====================
-- APPOINTMENTS POLICIES
-- ====================
-- Appointments should only be visible to participants
DROP POLICY IF EXISTS "Public can read appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can read appointments" ON appointments;

-- Only exhibitor or visitor can see their own appointments
CREATE POLICY "Users can see own appointments only"
ON appointments
FOR SELECT
USING (
  auth.uid() = exhibitor_id
  OR auth.uid() = visitor_id
);

-- ====================
-- COMMENTS
-- ====================
COMMENT ON POLICY "Public can read published news only" ON news_articles IS 'Permet uniquement la lecture des articles publiés';
COMMENT ON POLICY "Public can read verified exhibitors only" ON exhibitors IS 'Permet uniquement la lecture des exposants vérifiés';
COMMENT ON POLICY "Public can read products from verified exhibitors" ON products IS 'Permet la lecture des produits uniquement depuis des exposants vérifiés';
COMMENT ON POLICY "Public can read published mini-sites from verified exhibitors" ON mini_sites IS 'Permet la lecture des mini-sites publiés depuis des exposants vérifiés';
COMMENT ON POLICY "Public can read verified partners only" ON partners IS 'Permet uniquement la lecture des partenaires vérifiés';
COMMENT ON POLICY "Public can read featured events only" ON events IS 'Permet la lecture des événements featured ou futurs avec places disponibles';
COMMENT ON POLICY "Users can read own data or public profiles" ON users IS 'Utilisateurs peuvent lire leurs propres données ou les profils publics actifs';
COMMENT ON POLICY "Users can see own appointments only" ON appointments IS 'Utilisateurs peuvent voir uniquement leurs propres rendez-vous';
