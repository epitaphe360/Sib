-- Autorise le type 'service_client' dans public.users.type
-- afin que les agents Service Clientèle atterrissent sur l'espace dédié
-- (lookup / inscription sur place / remplacement / impression badge) au lieu
-- du scanner d'accès réservé à la sécurité.
--
-- Idempotent : remplace la contrainte CHECK existante par l'ensemble complet.

DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si présente (nom standard généré par Postgres)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_type_check'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_type_check;
  END IF;

  ALTER TABLE public.users
    ADD CONSTRAINT users_type_check
    CHECK (type IN ('visitor', 'exhibitor', 'partner', 'admin', 'security', 'service_client', 'marketing'));
END $$;
