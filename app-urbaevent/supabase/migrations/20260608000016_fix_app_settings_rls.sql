-- ============================================================
-- Correction RLS app_settings (idempotent)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'app_settings'
  ) THEN
    DROP POLICY IF EXISTS "Lecture app_settings authentifiée" ON app_settings;
    DROP POLICY IF EXISTS "Seuls les admins modifient app_settings" ON app_settings;
    DROP POLICY IF EXISTS "Tous les utilisateurs authentifiés lisent app_settings" ON app_settings;
    DROP POLICY IF EXISTS "app_settings_authenticated_read" ON app_settings;
    DROP POLICY IF EXISTS "app_settings_admin" ON app_settings;

    CREATE POLICY "app_settings_authenticated_read"
      ON app_settings FOR SELECT
      USING (auth.uid() IS NOT NULL);

    IF EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
      CREATE POLICY "app_settings_admin"
        ON app_settings FOR ALL
        USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'));
    END IF;
  END IF;
END;
$$;
