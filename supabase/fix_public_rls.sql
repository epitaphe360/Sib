-- Correction automatique des policies RLS pour accès public
-- 1. Exhibitors
ALTER TABLE exhibitors DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "Public can read exhibitors" ON exhibitors;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read exhibitors"
  ON exhibitors
  FOR SELECT
  TO public
  USING (true);

-- 2. Products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- 3. Mini-sites
ALTER TABLE mini_sites DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Anyone can read published mini-sites" ON mini_sites;
DROP POLICY IF EXISTS "Public can read published mini-sites" ON mini_sites;
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published mini-sites"
  ON mini_sites
  FOR SELECT
  TO public
  USING (published = true);

-- 4. Users (lecture profil propre uniquement)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::uuid = id);

-- 5. Events (si table existe)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Public can read events" ON events;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read events"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- 6. Partners (lecture des partenaires vérifiés)
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read verified partners" ON partners;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read verified partners"
  ON partners
  FOR SELECT
  TO public
  USING (verified = true);

-- 7. Conversations/messages (lecture publique désactivée, accès authentifié seulement)
-- Ajoutez ici si besoin

-- Fin de la correction automatique
