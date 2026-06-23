-- ============================================================
-- Ajout des colonnes speaker_name, speaker_title, salon_id à events
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    -- Créer la table events complète
    CREATE TABLE public.events (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title            text NOT NULL,
      description      text NOT NULL DEFAULT '',
      event_type       text NOT NULL DEFAULT 'conference',
      start_date       timestamptz NOT NULL DEFAULT now(),
      end_date         timestamptz NOT NULL DEFAULT now(),
      location         text,
      pavilion_id      uuid,
      capacity         integer,
      registered       integer DEFAULT 0,
      is_featured      boolean DEFAULT false,
      image_url        text,
      registration_url text,
      speaker_name     text,
      speaker_title    text,
      salon_id         uuid,
      created_at       timestamptz DEFAULT now(),
      updated_at       timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
    CREATE INDEX IF NOT EXISTS idx_events_salon_id   ON public.events(salon_id);

    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "events_public_read"
      ON public.events FOR SELECT USING (true);

  ELSE
    -- Table existe : ajouter uniquement les colonnes manquantes
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS speaker_name  text,
      ADD COLUMN IF NOT EXISTS speaker_title text,
      ADD COLUMN IF NOT EXISTS salon_id      uuid;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'events' AND indexname = 'idx_events_salon_id'
    ) THEN
      CREATE INDEX idx_events_salon_id ON public.events(salon_id);
    END IF;
  END IF;
END;
$$;

-- Politique admin (conditionnelle)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'events_admin'
  ) THEN
    CREATE POLICY "events_admin"
      ON public.events FOR ALL
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));
  END IF;
END;
$$;

-- FK salon_id (conditionnelle)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'salons'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'events' AND constraint_name = 'fk_events_salon_id'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT fk_events_salon_id
      FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;
  END IF;
END;
$$;
