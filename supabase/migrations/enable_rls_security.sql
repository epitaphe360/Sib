-- Enable Row Level Security (RLS) on all tables
-- CRITICAL pour la sécurité : empêche les accès non autorisés

-- ============================================================
-- USERS TABLE
-- ============================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- EXHIBITORS TABLE
-- ============================================================

ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active/approved exhibitors (public)
CREATE POLICY "Public can read approved exhibitors"
ON exhibitors FOR SELECT
USING (status = 'approved');

-- Policy: Exhibitors can read own data
CREATE POLICY "Exhibitors can read own data"
ON exhibitors FOR SELECT
USING (user_id = auth.uid());

-- Policy: Exhibitors can update own data
CREATE POLICY "Exhibitors can update own data"
ON exhibitors FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage exhibitors"
ON exhibitors FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products
CREATE POLICY "Public can read products"
ON products FOR SELECT
USING (true);

-- Policy: Exhibitors can manage own products
CREATE POLICY "Exhibitors can manage own products"
ON products FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can manage all products
CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Visitors can read own appointments
CREATE POLICY "Visitors can read own appointments"
ON appointments FOR SELECT
USING (visitor_id = auth.uid());

-- Policy: Exhibitors can read appointments with them
CREATE POLICY "Exhibitors can read their appointments"
ON appointments FOR SELECT
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Visitors can create appointments
CREATE POLICY "Visitors can create appointments"
ON appointments FOR INSERT
WITH CHECK (visitor_id = auth.uid());

-- Policy: Visitors can cancel own appointments
CREATE POLICY "Visitors can cancel own appointments"
ON appointments FOR UPDATE
USING (visitor_id = auth.uid())
WITH CHECK (visitor_id = auth.uid());

-- Policy: Exhibitors can manage their appointments
CREATE POLICY "Exhibitors can manage their appointments"
ON appointments FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- ============================================================
-- MINI_SITES TABLE
-- ============================================================

ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published mini-sites
CREATE POLICY "Public can read published mini-sites"
ON mini_sites FOR SELECT
USING (status = 'published');

-- Policy: Exhibitors can manage own mini-sites
CREATE POLICY "Exhibitors can manage own mini-sites"
ON mini_sites FOR ALL
USING (
  exhibitor_id IN (
    SELECT id FROM exhibitors WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can manage all mini-sites
CREATE POLICY "Admins can manage all mini-sites"
ON mini_sites FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- EVENTS TABLE
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read events
CREATE POLICY "Public can read events"
ON events FOR SELECT
USING (true);

-- Policy: Admins can manage events
CREATE POLICY "Admins can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND type = 'admin'
  )
);

-- ============================================================
-- MESSAGES TABLE (if exists)
-- ============================================================

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages sent to/from them
CREATE POLICY "Users can read own messages"
ON messages FOR SELECT
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- Policy: Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- CONNECTIONS TABLE (networking)
-- ============================================================

ALTER TABLE IF EXISTS connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read connections involving them
CREATE POLICY "Users can read own connections"
ON connections FOR SELECT
USING (
  user1_id = auth.uid() OR user2_id = auth.uid()
);

-- Policy: Users can create connections
CREATE POLICY "Users can create connections"
ON connections FOR INSERT
WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SUMMARY
-- ============================================================

-- Toutes les tables ont maintenant RLS activé
-- Les politiques garantissent que :
-- 1. Les utilisateurs ne voient que leurs propres données
-- 2. Les données publiques sont accessibles à tous
-- 3. Les admins ont accès complet
-- 4. Les exhibitors gèrent leurs propres produits/mini-sites/RDV
-- 5. Les visiteurs gèrent leurs propres RDV et connexions

-- Pour vérifier que RLS est activé partout :
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
