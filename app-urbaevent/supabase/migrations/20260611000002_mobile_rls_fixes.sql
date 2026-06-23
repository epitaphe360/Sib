-- Migration: Corrections RLS pour l'app mobile
-- Permet aux rôles staff / service_client / security de lire user_badges et users
-- Permet aux admins de mettre à jour les paiements et les statuts utilisateurs

-- ─── user_badges : lecture pour staff, service_client, security ────────────
DROP POLICY IF EXISTS "Authenticated can read own badge" ON public.user_badges;
DROP POLICY IF EXISTS "Staff can read all badges"        ON public.user_badges;
DROP POLICY IF EXISTS "Service client can read badges"   ON public.user_badges;

-- Lecture : chacun voit son propre badge
CREATE POLICY "Read own badge"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Lecture : staff (admin, security, marketing) lit tous les badges
CREATE POLICY "Staff can read all badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND type IN ('admin', 'security', 'marketing')
    )
  );

-- Lecture : service_client lit tous les badges
CREATE POLICY "Service client can read badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'service_client'
    )
  );

-- ─── users : lecture élargie pour staff / service_client ───────────────────
DROP POLICY IF EXISTS "Staff can read all users"        ON public.users;
DROP POLICY IF EXISTS "Service client can read users"   ON public.users;
DROP POLICY IF EXISTS "Security can read users"         ON public.users;

CREATE POLICY "Staff can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS me
      WHERE me.id = auth.uid()
        AND me.type IN ('admin', 'security', 'marketing', 'service_client')
    )
  );

-- ─── users : mise à jour de status par admin ───────────────────────────────
DROP POLICY IF EXISTS "Admin can update user status" ON public.users;

CREATE POLICY "Admin can update user status"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users AS me
      WHERE me.id = auth.uid() AND me.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users AS me
      WHERE me.id = auth.uid() AND me.type = 'admin'
    )
  );

-- ─── payment_requests : lecture/mise à jour par admin ──────────────────────
DROP POLICY IF EXISTS "Admin can manage payment requests" ON public.payment_requests;

CREATE POLICY "Admin can read payment requests"
  ON public.payment_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type IN ('admin', 'service_client')
    )
  );

CREATE POLICY "Admin can update payment requests"
  ON public.payment_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ─── access_logs : insertion par security / staff ──────────────────────────
DROP POLICY IF EXISTS "Staff can insert access logs" ON public.access_logs;

CREATE POLICY "Staff can insert access logs"
  ON public.access_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND type IN ('admin', 'security', 'marketing', 'service_client')
    )
  );

-- Lecture : staff lit tous les logs
CREATE POLICY "Staff can read access logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND type IN ('admin', 'security', 'marketing', 'service_client')
    )
  );

-- ─── registration_requests : lecture/mise à jour par admin ─────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'registration_requests'
  ) THEN
    EXECUTE $pol$
      DROP POLICY IF EXISTS "Admin can manage registration requests" ON public.registration_requests;

      CREATE POLICY "Admin can read registration requests"
        ON public.registration_requests FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND type = 'admin'
          )
        );

      CREATE POLICY "Admin can update registration requests"
        ON public.registration_requests FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND type = 'admin'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND type = 'admin'
          )
        );
    $pol$;
  END IF;
END $$;
