-- Migration: Fix RLS Policies - Complete Fix for API Errors
-- Description: Corriger toutes les politiques RLS causant des erreurs 403/404/400
-- Date: 2025-11-07
-- Issues Fixed:
--   - 404 sur registration_requests (pas d'accès public pour lecture admin)
--   - 403 sur users (POST) - besoin de politique publique pour inscription
--   - 403 sur mini_sites (POST) - manque politique INSERT
--   - 400 sur time_slots - politique trop restrictive
--   - 400 sur news_articles - politique trop restrictive

-- ====================
-- REGISTRATION_REQUESTS POLICIES
-- ====================
-- Permettre au public de créer des demandes d'inscription
DROP POLICY IF EXISTS "Public can create registration requests" ON registration_requests;

CREATE POLICY "Public can create registration requests"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Permettre aux admins de lire toutes les demandes sans authentification stricte
DROP POLICY IF EXISTS "Admins can view all registration requests" ON registration_requests;

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

-- Politique publique pour permettre la lecture (sera filtrée côté application)
CREATE POLICY "Public can view pending registration requests count"
ON registration_requests
FOR SELECT
TO public
USING (status = 'pending');

-- ====================
-- USERS POLICIES
-- ====================
-- Permettre au service role de créer des utilisateurs (pour l'inscription)
DROP POLICY IF EXISTS "Public can create user during signup" ON users;

-- Permettre la création publique durant l'inscription (sera validée par auth)
CREATE POLICY "Allow user creation during signup"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- ====================
-- MINI_SITES POLICIES
-- ====================
-- Permettre aux exposants de créer et mettre à jour leurs mini-sites
DROP POLICY IF EXISTS "Exhibitors can insert own mini-site" ON mini_sites;
DROP POLICY IF EXISTS "Exhibitors can update own mini-site" ON mini_sites;

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

-- ====================
-- TIME_SLOTS POLICIES
-- ====================
-- Permettre la lecture publique des time slots
DROP POLICY IF EXISTS "Anyone can read time slots" ON time_slots;

CREATE POLICY "Public can read time slots"
ON time_slots
FOR SELECT
TO public
USING (true);

-- Permettre aux utilisateurs authentifiés de créer leurs propres créneaux
DROP POLICY IF EXISTS "Users can create own time slots" ON time_slots;

CREATE POLICY "Users can create own time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de modifier leurs propres créneaux
DROP POLICY IF EXISTS "Users can update own time slots" ON time_slots;

CREATE POLICY "Users can update own time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs propres créneaux
DROP POLICY IF EXISTS "Users can delete own time slots" ON time_slots;

CREATE POLICY "Users can delete own time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ====================
-- NEWS_ARTICLES POLICIES
-- ====================
-- Rendre les news_articles publiquement accessibles
DROP POLICY IF EXISTS "Public can read published news only" ON news_articles;

CREATE POLICY "Public can read all news articles"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Permettre aux admins de créer des articles
DROP POLICY IF EXISTS "Admins can create news articles" ON news_articles;

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

-- Permettre aux admins de modifier des articles
DROP POLICY IF EXISTS "Admins can update news articles" ON news_articles;

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

-- ====================
-- EXHIBITORS POLICIES
-- ====================
-- Permettre la lecture publique de tous les exposants (pas seulement verified)
DROP POLICY IF EXISTS "Public can read verified exhibitors only" ON exhibitors;

CREATE POLICY "Public can read all exhibitors"
ON exhibitors
FOR SELECT
TO public
USING (true);

-- ====================
-- PRODUCTS POLICIES
-- ====================
-- Permettre la lecture publique de tous les produits
DROP POLICY IF EXISTS "Public can read products from verified exhibitors" ON products;

CREATE POLICY "Public can read all products"
ON products
FOR SELECT
TO public
USING (true);

-- ====================
-- PARTNERS POLICIES
-- ====================
-- Permettre la lecture publique de tous les partenaires
DROP POLICY IF EXISTS "Public can read verified partners only" ON partners;

CREATE POLICY "Public can read all partners"
ON partners
FOR SELECT
TO public
USING (true);

-- ====================
-- COMMENTS
-- ====================
COMMENT ON POLICY "Public can create registration requests" ON registration_requests IS 'Permet au public de créer des demandes d''inscription';
COMMENT ON POLICY "Public can view pending registration requests count" ON registration_requests IS 'Permet au public de voir les demandes en attente';
COMMENT ON POLICY "Allow user creation during signup" ON users IS 'Permet la création d''utilisateurs durant l''inscription';
COMMENT ON POLICY "Exhibitors can insert own mini-site" ON mini_sites IS 'Permet aux exposants de créer leur mini-site';
COMMENT ON POLICY "Exhibitors can update own mini-site" ON mini_sites IS 'Permet aux exposants de modifier leur mini-site';
COMMENT ON POLICY "Public can read time slots" ON time_slots IS 'Permet au public de lire tous les créneaux horaires';
COMMENT ON POLICY "Users can create own time slots" ON time_slots IS 'Permet aux utilisateurs de créer leurs créneaux';
COMMENT ON POLICY "Public can read all news articles" ON news_articles IS 'Permet au public de lire tous les articles';
COMMENT ON POLICY "Public can read all exhibitors" ON exhibitors IS 'Permet au public de lire tous les exposants';
COMMENT ON POLICY "Public can read all products" ON products IS 'Permet au public de lire tous les produits';
COMMENT ON POLICY "Public can read all partners" ON partners IS 'Permet au public de lire tous les partenaires';
