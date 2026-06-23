-- Permet à l'app mobile de lire la configuration badge définie dans /admin/badge-config
-- Sans exposer les autres clés sensibles de app_settings.

CREATE OR REPLACE FUNCTION public.get_badge_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT value::jsonb FROM public.app_settings WHERE key = 'badge_config_v1' LIMIT 1),
    (SELECT value::jsonb FROM public.app_settings WHERE key = 'badge_config' LIMIT 1),
    '{}'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_badge_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_badge_config() TO anon;

-- Lecture directe limitée à la clé badge (fallback si RPC indisponible)
DROP POLICY IF EXISTS "Authenticated read badge_config only" ON public.app_settings;

CREATE POLICY "Authenticated read badge_config only"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (key IN ('badge_config_v1', 'badge_config'));
