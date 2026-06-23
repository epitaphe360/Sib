-- Fix: infinite recursion (42P17) sur public.users
-- La migration 20260611000002 a réintroduit des politiques qui relisent users dans users.

-- ─── Fonctions SECURITY DEFINER (pas de récursion RLS) ─────────────────────
CREATE OR REPLACE FUNCTION public.auth_user_type()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT type::text FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_service()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND type IN ('admin', 'security', 'marketing', 'service_client')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_security_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND type IN ('admin', 'security', 'marketing')
  );
$$;

REVOKE ALL ON FUNCTION public.auth_user_type() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff_or_service() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_security_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_type() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_or_service() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_security_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_user_type() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff_or_service() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_security_staff() TO service_role;

-- Profil courant — contournement fiable pour l'app mobile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  row_data jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT to_jsonb(u.*) INTO row_data
  FROM (
    SELECT id, email, name, type, visitor_level, partner_tier, status, profile
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1
  ) u;
  RETURN row_data;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ─── users : lecture propre ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Staff can read all users" ON public.users;
DROP POLICY IF EXISTS "Service client can read users" ON public.users;
DROP POLICY IF EXISTS "Security can read users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.is_staff_or_service());

-- Admin update (si is_admin() existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admin can update user status" ON public.users';
    EXECUTE $pol$
      CREATE POLICY "Admin can update user status"
        ON public.users FOR UPDATE
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $pol$;
  END IF;
END $$;

-- ─── user_badges ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can read all badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service client can read badges" ON public.user_badges;

CREATE POLICY "Staff can read all badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (public.is_security_staff());

CREATE POLICY "Service client can read badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (public.auth_user_type() = 'service_client');

-- ─── payment_requests ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin can read payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admin can update payment requests" ON public.payment_requests;

CREATE POLICY "Admin can read payment requests"
  ON public.payment_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_staff_or_service()
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Admin can update payment requests"
        ON public.payment_requests FOR UPDATE
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $pol$;
  END IF;
END $$;

-- ─── access_logs ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can insert access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Staff can read access logs" ON public.access_logs;

CREATE POLICY "Staff can insert access logs"
  ON public.access_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_service());

CREATE POLICY "Staff can read access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (public.is_staff_or_service());

-- ─── registration_requests ──────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'registration_requests'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admin can manage registration requests" ON public.registration_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can read registration requests" ON public.registration_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can update registration requests" ON public.registration_requests';

    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN
      EXECUTE $pol$
        CREATE POLICY "Admin can read registration requests"
          ON public.registration_requests FOR SELECT
          TO authenticated
          USING (public.is_admin())
      $pol$;
      EXECUTE $pol$
        CREATE POLICY "Admin can update registration requests"
          ON public.registration_requests FOR UPDATE
          TO authenticated
          USING (public.is_admin())
          WITH CHECK (public.is_admin())
      $pol$;
    END IF;
  END IF;
END $$;
