-- One-shot SQL: fix policies (idempotent) and seed demo exhibitors
-- Run this file in Supabase SQL editor. It is safe to run multiple times.

BEGIN;

-- 1) Ensure helper: is_admin(uuid)
-- Drop old definition if present to avoid "cannot change name of input parameter" error
-- Drop dependent policy first if present to allow dropping the function safely
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE FUNCTION public.is_admin(p uuid) RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p AND u.type = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- 2) EXHIBITORS: enable RLS and idempotent policies
ALTER TABLE IF EXISTS public.exhibitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exhibitors can manage own data" ON public.exhibitors;
CREATE POLICY "Exhibitors can manage own data"
  ON public.exhibitors
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Public can read exhibitors" ON public.exhibitors;
CREATE POLICY "Public can read exhibitors"
  ON public.exhibitors
  FOR SELECT
  TO public
  USING (true);

-- 3) MINI_SITES: enable RLS and owner policies (owner = exhibitors.user_id)
ALTER TABLE IF EXISTS public.mini_sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exhibitors can manage own mini-sites" ON public.mini_sites;
CREATE POLICY "Exhibitors can manage own mini-sites"
  ON public.mini_sites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitors e
      WHERE e.id = public.mini_sites.exhibitor_id
        AND e.user_id = auth.uid()::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exhibitors e
      WHERE e.id = public.mini_sites.exhibitor_id
        AND e.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Public can read published mini-sites" ON public.mini_sites;
CREATE POLICY "Public can read published mini-sites"
  ON public.mini_sites
  FOR SELECT
  TO public
  USING (published = true);

-- 4) PRODUCTS: enable RLS and owner policies (owner = exhibitors.user_id)
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exhibitors can manage own products" ON public.products;
CREATE POLICY "Exhibitors can manage own products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exhibitors e
      WHERE e.id = public.products.exhibitor_id
        AND e.user_id = auth.uid()::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exhibitors e
      WHERE e.id = public.products.exhibitor_id
        AND e.user_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- 5) USERS: enable RLS and self/admin policies
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()::uuid))
  WITH CHECK (is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- 6) Seed sample exhibitors/users (idempotent guard)
DO $$
DECLARE
  dataset JSONB;
  elem JSONB;
  v_user_id UUID;
  v_exhibitor_id UUID;
BEGIN
  -- skip if already populated
  IF (SELECT COUNT(*) FROM public.exhibitors) > 0 THEN
    RAISE NOTICE 'Skipping seed: exhibitors table already contains rows.';
    RETURN;
  END IF;

  dataset := '[
    {
      "company_name": "Port Solutions Inc.",
      "email": "contact@portsolutions.com",
      "category": "port-operations",
      "sector": "Port Management",
      "description": "Leading provider of integrated port management solutions.",
      "logo_url": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      "website": "https://portsolutions.com",
      "verified": true,
      "featured": true,
      "contact_info": { "email": "contact@portsolutions.com", "phone": "+33123456789", "city": "Le Havre", "country": "France" }
    },
    {
      "company_name": "Maritime Tech Solutions",
      "email": "contact@maritimetech.com",
      "category": "port-industry",
      "sector": "Equipment Manufacturing",
      "description": "Innovative manufacturer of port equipment and automation systems.",
      "logo_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
      "website": "https://maritimetech.com",
      "verified": true,
      "featured": false,
      "contact_info": { "email": "contact@maritimetech.com", "phone": "+33123456789", "city": "Marseille", "country": "France" }
    },
    {
      "company_name": "Global Port Authority",
      "email": "contact@globalportauthority.org",
      "category": "institutional",
      "sector": "Government",
      "description": "International organization promoting sustainable port development.",
      "logo_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      "website": "https://globalportauthority.org",
      "verified": true,
      "featured": true,
      "contact_info": { "email": "contact@globalportauthority.org", "phone": "+33123456789", "city": "Paris", "country": "France" }
    }
  ]'::jsonb;

  FOR elem IN SELECT * FROM jsonb_array_elements(dataset) LOOP
    IF (elem->>'email') IS NOT NULL THEN
      SELECT id INTO v_user_id FROM public.users WHERE email = (elem->>'email') LIMIT 1;
      IF v_user_id IS NULL THEN
        INSERT INTO public.users (id, email, name, type, profile, created_at, updated_at)
        VALUES (gen_random_uuid(), elem->>'email', elem->>'company_name', 'exhibitor', '{}'::jsonb, now(), now())
        RETURNING id INTO v_user_id;
      END IF;
    ELSE
      v_user_id := gen_random_uuid();
      INSERT INTO public.users (id, email, name, type, profile, created_at, updated_at)
      VALUES (v_user_id, NULL, elem->>'company_name', 'exhibitor', '{}'::jsonb, now(), now())
      ON CONFLICT (id) DO NOTHING;
    END IF;

    SELECT id INTO v_exhibitor_id FROM public.exhibitors WHERE user_id = v_user_id LIMIT 1;
    IF v_exhibitor_id IS NULL THEN
      INSERT INTO public.exhibitors (id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v_user_id,
        elem->>'company_name',
        (elem->>'category')::exhibitor_category,
        elem->>'sector',
        elem->>'description',
        elem->>'logo_url',
        elem->>'website',
        (elem->>'verified')::boolean,
        (elem->>'featured')::boolean,
        COALESCE(elem->'contact_info','{}'::jsonb),
        now(), now()
      );
    END IF;
  END LOOP;
END$$;

COMMIT;

-- End of one-shot script
