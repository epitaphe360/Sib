-- ============================================================
-- Table certificates — certificats de participation SIB 2026
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'certificates'
  ) THEN
    CREATE TABLE public.certificates (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    uuid NOT NULL,
      salon_id   uuid,
      badge_code text,
      issued_at  timestamptz DEFAULT now(),
      status     text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
      pdf_url    text,
      created_at timestamptz DEFAULT now()
    );

    CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);

    ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

    -- Politique de base : les utilisateurs voient leurs propres certificats
    CREATE POLICY "certificates_own_read"
      ON public.certificates FOR SELECT
      USING (auth.uid() = user_id);

    -- Politique d'insertion : tout utilisateur authentifié
    CREATE POLICY "certificates_authenticated_insert"
      ON public.certificates FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END;
$$;

-- Politiques admin + FK conditionnelles (nécessitent users/salons)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificates'
  ) THEN
    -- FK vers users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'certificates' AND constraint_name = 'fk_certificates_user_id'
    ) THEN
      ALTER TABLE public.certificates
        ADD CONSTRAINT fk_certificates_user_id
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- FK vers salons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'salons')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'certificates' AND constraint_name = 'fk_certificates_salon_id'
    ) THEN
      ALTER TABLE public.certificates
        ADD CONSTRAINT fk_certificates_salon_id
        FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;
    END IF;

    -- Politique admin
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_admin'
    ) THEN
      CREATE POLICY "certificates_admin"
        ON public.certificates FOR ALL
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type IN ('admin', 'service_client')));
    END IF;
  END IF;
END;
$$;
