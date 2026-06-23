-- ============================================================
-- Table stand_collaborators — collaborateurs de stand
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stand_collaborators'
  ) THEN
    CREATE TABLE public.stand_collaborators (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id        uuid NOT NULL,
      owner_type      text NOT NULL CHECK (owner_type IN ('exhibitor', 'partner')),
      exhibitor_id    uuid,
      partner_id      uuid,
      first_name      text NOT NULL,
      last_name       text NOT NULL,
      email           text NOT NULL,
      phone           text,
      position        text DEFAULT 'Staff Stand',
      auth_user_id    uuid,
      temp_password   text,
      credentials_sent_at timestamptz,
      badge_generated boolean DEFAULT false,
      badge_url       text,
      status          text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
      created_at      timestamptz DEFAULT now(),
      updated_at      timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_stand_collaborators_owner ON public.stand_collaborators(owner_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_stand_collaborators_email ON public.stand_collaborators(email);

    ALTER TABLE public.stand_collaborators ENABLE ROW LEVEL SECURITY;

    -- Politiques sans dépendance sur users
    CREATE POLICY "sc_owner_manage"
      ON public.stand_collaborators
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());

    CREATE POLICY "sc_collaborator_view_own"
      ON public.stand_collaborators
      USING (auth_user_id = auth.uid());
  END IF;
END;
$$;

-- Politiques admin + FK conditionnelles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stand_collaborators'
  ) THEN
    -- FK vers exhibitors
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exhibitors')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'stand_collaborators' AND constraint_name = 'fk_sc_exhibitor'
    ) THEN
      ALTER TABLE public.stand_collaborators
        ADD CONSTRAINT fk_sc_exhibitor FOREIGN KEY (exhibitor_id) REFERENCES public.exhibitors(id) ON DELETE CASCADE;
    END IF;

    -- FK vers partners
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partners')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'stand_collaborators' AND constraint_name = 'fk_sc_partner'
    ) THEN
      ALTER TABLE public.stand_collaborators
        ADD CONSTRAINT fk_sc_partner FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
    END IF;

    -- Politique admin
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'stand_collaborators' AND policyname = 'sc_admin'
    ) THEN
      CREATE POLICY "sc_admin"
        ON public.stand_collaborators FOR ALL
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));
    END IF;
  END IF;
END;
$$;
