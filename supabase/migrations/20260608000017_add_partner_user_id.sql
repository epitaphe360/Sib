-- ============================================================
-- Ajout de user_id à la table partners
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'partners'
  ) THEN
    ALTER TABLE public.partners
      ADD COLUMN IF NOT EXISTS user_id uuid;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'partners' AND indexname = 'idx_partners_user_id'
    ) THEN
      CREATE INDEX idx_partners_user_id ON public.partners(user_id);
    END IF;

    -- Ajouter FK vers users si la table users existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'partners' AND tc.constraint_name = 'fk_partners_user_id'
    ) THEN
      ALTER TABLE public.partners
        ADD CONSTRAINT fk_partners_user_id
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END;
$$;
