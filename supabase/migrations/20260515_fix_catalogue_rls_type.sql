-- Fix: corriger les politiques RLS catalogue qui utilisaient "role" au lieu de "type"
-- Dans public.users, la colonne admin est "type = 'admin'" pas "role IN ('admin', 'super_admin')"

-- catalogue_entries
DROP POLICY IF EXISTS "admin_full_access_catalogue" ON public.catalogue_entries;
CREATE POLICY "admin_full_access_catalogue" ON public.catalogue_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- catalogue_reminders_log
DROP POLICY IF EXISTS "admin_full_access_reminders" ON public.catalogue_reminders_log;
CREATE POLICY "admin_full_access_reminders" ON public.catalogue_reminders_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
