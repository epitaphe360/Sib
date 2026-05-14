-- Fix: correction des politiques RLS du catalogue
-- user_profiles.id est la PK propre de la table, pas l'auth uid.
-- Le FK vers auth.users est user_profiles.user_id
-- On utilise la table users (id = auth.uid()) qui est plus directe.

-- Supprimer les politiques incorrectes
DROP POLICY IF EXISTS "admin_full_access_catalogue" ON public.catalogue_entries;
DROP POLICY IF EXISTS "admin_full_access_reminders" ON public.catalogue_reminders_log;

-- Recréer avec users.id = auth.uid()
CREATE POLICY "admin_full_access_catalogue" ON public.catalogue_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "admin_full_access_reminders" ON public.catalogue_reminders_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );
