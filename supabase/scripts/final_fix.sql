-- FINAL FIX (SAFE + REVERSIBLE)
-- 1) Ensure helper function is present (SECURITY DEFINER)
-- 2) Create a public_users view exposing only safe fields
-- 3) Remove any public policy on users and grant SELECT on public_users
-- 4) Ensure exhibitors/products/mini_sites have public read policies where appropriate

BEGIN;

-- 1) Helper
CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = p_uid AND type = 'admin'
  );
$$;

-- 2) Create public_users view (adaptez les colonnes exposées selon vos besoins)
CREATE OR REPLACE VIEW public.public_users AS
SELECT id,
       name,
       NULL::text AS email, -- masqué par défaut
       profile->>'public_bio' AS public_bio
FROM public.users;

GRANT SELECT ON public.public_users TO public;

-- 3) Remove public policies on users (si existantes) and keep RLS active
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Create admin policy for users (admins only, using is_admin)
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  TO authenticated
  -- is_admin expects uuid, cast auth.uid()
  USING (is_admin(auth.uid()::uuid));

-- 4) Public read policies for other tables
-- Exhibitors
ALTER TABLE public.exhibitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read exhibitors" ON public.exhibitors;
CREATE POLICY "Public can read exhibitors" ON public.exhibitors
  FOR SELECT
  TO public
  USING (true);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Mini-sites: only published
ALTER TABLE public.mini_sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published mini-sites" ON public.mini_sites;
CREATE POLICY "Public can read published mini-sites" ON public.mini_sites
  FOR SELECT
  TO public
  USING (published = true);

COMMIT;

-- NOTES:
-- - Cette opération expose un view `public_users` contenant seulement des champs "sûrs".
-- - Si vous souhaitez exposer email ou autres champs, modifiez la view en connaissance de cause.
-- - Pour rollback, voir rollback_policies.sql (généré séparément).
