-- ============================================================
-- Table live_sessions — diffusions en direct SIB 2026
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'live_sessions'
  ) THEN
    CREATE TABLE public.live_sessions (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title        text NOT NULL,
      description  text,
      stream_url   text NOT NULL,
      status       text NOT NULL DEFAULT 'upcoming'
                     CHECK (status IN ('upcoming', 'live', 'ended')),
      start_time   timestamptz,
      speaker_name text,
      created_at   timestamptz DEFAULT now(),
      updated_at   timestamptz DEFAULT now()
    );

    ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "live_sessions_public_read"
      ON public.live_sessions FOR SELECT
      USING (true);

    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
  END IF;
END;
$$;

-- Politique admin séparée (nécessite que users existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'live_sessions'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'live_sessions' AND policyname = 'live_sessions_admin'
  ) THEN
    CREATE POLICY "live_sessions_admin"
      ON public.live_sessions FOR ALL
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));
  END IF;
END;
$$;
