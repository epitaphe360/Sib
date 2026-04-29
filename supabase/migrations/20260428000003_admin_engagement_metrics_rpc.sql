-- ============================================================
-- RPC admin : comptages d'engagement sans blocage RLS
-- SECURITY DEFINER => bypass RLS, réservé aux admins
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_engagement_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
  v_appointments bigint;
  v_messages    bigint;
  v_connections bigint;
  v_downloads   bigint;
BEGIN
  -- Vérifier que l'appelant est admin
  SELECT type INTO v_user_type FROM users WHERE id = auth.uid();
  IF v_user_type IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Accès refusé — réservé aux administrateurs';
  END IF;

  SELECT COUNT(*) INTO v_appointments FROM appointments;
  SELECT COUNT(*) INTO v_messages    FROM messages;
  SELECT COUNT(*) INTO v_connections FROM connections;

  -- La table downloads peut ne pas exister encore
  BEGIN
    SELECT COUNT(*) INTO v_downloads FROM downloads;
  EXCEPTION WHEN undefined_table THEN
    v_downloads := 0;
  END;

  RETURN json_build_object(
    'appointments', v_appointments,
    'messages',    v_messages,
    'connections', v_connections,
    'downloads',   v_downloads
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_engagement_metrics() TO authenticated;

-- ============================================================
-- Politiques RLS admin — lecture globale (bypass par type)
-- Permettent aussi les requêtes directes si le RPC n'est pas dispo
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Admins can read all appointments'
  ) THEN
    CREATE POLICY "Admins can read all appointments" ON appointments
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Admins can read all messages'
  ) THEN
    CREATE POLICY "Admins can read all messages" ON messages
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'connections' AND policyname = 'Admins can read all connections'
  ) THEN
    CREATE POLICY "Admins can read all connections" ON connections
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin'
      ));
  END IF;
END $$;
