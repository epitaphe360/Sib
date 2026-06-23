-- ============================================================
-- Table visa_invitation_requests — lettres d'invitation visa SIB 2026
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visa_invitation_requests'
  ) THEN
    CREATE TABLE public.visa_invitation_requests (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          uuid NOT NULL,
      user_email       text NOT NULL,
      first_name       text NOT NULL,
      last_name        text NOT NULL,
      passport_number  text NOT NULL,
      nationality      text NOT NULL,
      date_of_birth    date,
      organization     text,
      job_title        text,
      address          text,
      status           text NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved', 'rejected')),
      rejection_reason text,
      reviewed_by      uuid,
      reviewed_at      timestamptz,
      created_at       timestamptz DEFAULT now(),
      updated_at       timestamptz DEFAULT now()
    );

    CREATE INDEX idx_visa_requests_user_id ON public.visa_invitation_requests(user_id);
    CREATE INDEX idx_visa_requests_status  ON public.visa_invitation_requests(status);

    ALTER TABLE public.visa_invitation_requests ENABLE ROW LEVEL SECURITY;

    -- Politiques de base sans dépendance sur users
    CREATE POLICY "visa_own_read"
      ON public.visa_invitation_requests FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "visa_own_insert"
      ON public.visa_invitation_requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

-- Politiques admin + FK conditionnelles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'visa_invitation_requests'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- FK vers users
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'visa_invitation_requests' AND constraint_name = 'fk_visa_user_id'
    ) THEN
      ALTER TABLE public.visa_invitation_requests
        ADD CONSTRAINT fk_visa_user_id
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Politique admin
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'visa_invitation_requests' AND policyname = 'visa_admin'
    ) THEN
      CREATE POLICY "visa_admin"
        ON public.visa_invitation_requests FOR ALL
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));
    END IF;
  END IF;
END;
$$;
