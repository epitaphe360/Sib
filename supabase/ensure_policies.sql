-- Ensure requested RLS policies exist (idempotent)
-- Assumptions:
--  - `public.is_admin(uuid)` exists for admin checks (created in combined_apply.sql)
--  - `public.exhibitors` has an `owner_id uuid` column linking to users.id
--  - `public.products` and `public.mini_sites` have `exhibitor_id uuid` columns
-- If your schema uses different column names, adjust the `owner_id` / `exhibitor_id` references.

BEGIN;

-- USERS: allow users to update/read their own data
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::uuid = id)
  WITH CHECK (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::uuid = id);

-- Admins manage users (requires public.is_admin function)
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()::uuid));


-- EXHIBITORS: public read + exhibitors manage own data
ALTER TABLE IF EXISTS public.exhibitors ENABLE ROW LEVEL SECURITY;
-- Create public read policy and an ownership policy where an ownership column exists.
DO $$
BEGIN
  -- public read policy (always safe)
  EXECUTE 'DROP POLICY IF EXISTS "Public can read exhibitors" ON public.exhibitors;';
  EXECUTE 'CREATE POLICY "Public can read exhibitors" ON public.exhibitors FOR SELECT TO public USING (true);';

  -- Create ownership policy only when a plausible ownership column exists.
  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'owner_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own data" ON public.exhibitors;
      CREATE POLICY "Exhibitors can manage own data" ON public.exhibitors
        FOR ALL TO authenticated
        USING (owner_id = auth.uid()::uuid)
        WITH CHECK (owner_id = auth.uid()::uuid);
    $sql$;
  ELSIF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors' AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own data" ON public.exhibitors;
      CREATE POLICY "Exhibitors can manage own data" ON public.exhibitors
        FOR ALL TO authenticated
        USING (user_id = auth.uid()::uuid)
        WITH CHECK (user_id = auth.uid()::uuid);
    $sql$;
  END IF;
END
$$;


-- PRODUCTS: public read + exhibitors manage their products
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
-- Create public read policy and an ownership policy when possible.
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Public can read products" ON public.products;';
  EXECUTE 'CREATE POLICY "Public can read products" ON public.products FOR SELECT TO public USING (true);';

  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'exhibitor_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own products" ON public.products;
      CREATE POLICY "Exhibitors can manage own products" ON public.products
        FOR ALL TO authenticated
        USING (exhibitor_id = auth.uid()::uuid)
        WITH CHECK (exhibitor_id = auth.uid()::uuid);
    $sql$;
  ELSIF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own products" ON public.products;
      CREATE POLICY "Exhibitors can manage own products" ON public.products
        FOR ALL TO authenticated
        USING (user_id = auth.uid()::uuid)
        WITH CHECK (user_id = auth.uid()::uuid);
    $sql$;
  END IF;
END
$$;


-- MINI_SITES: public read only published, exhibitors manage own mini-sites
ALTER TABLE IF EXISTS public.mini_sites ENABLE ROW LEVEL SECURITY;
-- Create public read policy and ownership policy conditionally.
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Public can read published mini-sites" ON public.mini_sites;';
  EXECUTE 'CREATE POLICY "Public can read published mini-sites" ON public.mini_sites FOR SELECT TO public USING (published = true);';

  IF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mini_sites' AND column_name = 'exhibitor_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own mini-sites" ON public.mini_sites;
      CREATE POLICY "Exhibitors can manage own mini-sites" ON public.mini_sites
        FOR ALL TO authenticated
        USING (exhibitor_id = auth.uid()::uuid)
        WITH CHECK (exhibitor_id = auth.uid()::uuid);
    $sql$;
  ELSIF EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mini_sites' AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Exhibitors can manage own mini-sites" ON public.mini_sites;
      CREATE POLICY "Exhibitors can manage own mini-sites" ON public.mini_sites
        FOR ALL TO authenticated
        USING (user_id = auth.uid()::uuid)
        WITH CHECK (user_id = auth.uid()::uuid);
    $sql$;
  END IF;
END
$$;

COMMIT;

-- Notes:
--  - Run this file in Supabase SQL Editor or via your migration runner.
--  - If your schema uses different ownership column names (for example `user_id` or `owner_uuid`), replace the `owner_id`/`exhibitor_id` references accordingly before running.
--  - If you need more granular privileges (separate INSERT/UPDATE/DELETE rules), split the FOR ALL policies into specific FOR INSERT/UPDATE/DELETE policies.
