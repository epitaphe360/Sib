-- Sync badge A4 web → mobile : normalise badge_config_v1 et expose get_badge_config()
-- Compatible colonne app_settings.value en TEXT ou JSONB (prod peut différer du schéma local).

CREATE OR REPLACE FUNCTION public.normalize_app_setting_jsonb(raw text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parsed jsonb;
BEGIN
  IF raw IS NULL OR btrim(raw) = '' THEN
    RETURN '{}'::jsonb;
  END IF;

  BEGIN
    parsed := raw::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN '{}'::jsonb;
  END;

  IF jsonb_typeof(parsed) = 'string' THEN
    BEGIN
      RETURN (parsed #>> '{}')::jsonb;
    EXCEPTION WHEN OTHERS THEN
      RETURN '{}'::jsonb;
    END;
  END IF;

  IF jsonb_typeof(parsed) = 'object' THEN
    RETURN parsed;
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

-- Normalise les lignes badge (double encodage JSON string → objet)
DO $$
DECLARE
  col_type text;
  normalized jsonb;
BEGIN
  SELECT c.data_type
  INTO col_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'app_settings'
    AND c.column_name = 'value';

  IF col_type IS NULL THEN
    RETURN;
  END IF;

  IF col_type = 'text' THEN
    UPDATE public.app_settings AS s
    SET
      value = public.normalize_app_setting_jsonb(s.value)::text,
      updated_at = now()
    WHERE s.key IN ('badge_config_v1', 'badge_config')
      AND public.normalize_app_setting_jsonb(s.value) <> '{}'::jsonb;
  ELSE
    UPDATE public.app_settings AS s
    SET
      value = public.normalize_app_setting_jsonb(s.value::text),
      updated_at = now()
    WHERE s.key IN ('badge_config_v1', 'badge_config')
      AND public.normalize_app_setting_jsonb(s.value::text) <> '{}'::jsonb;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_badge_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (
      SELECT public.normalize_app_setting_jsonb(value::text)
      FROM public.app_settings
      WHERE key = 'badge_config_v1'
      LIMIT 1
    ),
    (
      SELECT public.normalize_app_setting_jsonb(value::text)
      FROM public.app_settings
      WHERE key = 'badge_config'
      LIMIT 1
    ),
    '{}'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.normalize_app_setting_jsonb(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_app_setting_jsonb(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_badge_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_badge_config() TO anon;
