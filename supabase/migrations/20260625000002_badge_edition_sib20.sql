-- Badge A4 : 20ème édition SIB 2026 (au lieu du défaut « 1ère édition »)
UPDATE public.app_settings
SET
  value = (
    COALESCE(value::jsonb, '{}'::jsonb) || '{"event_edition": "20ème édition"}'::jsonb
  )::text,
  updated_at = now()
WHERE key = 'badge_config_v1';

INSERT INTO public.app_settings (key, value, updated_at)
SELECT
  'badge_config_v1',
  '{"event_name":"SIB 2026","event_edition":"20ème édition","event_dates_display":"25 – 29 Novembre 2026","event_location":"El Jadida, Maroc"}'::text,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_settings WHERE key = 'badge_config_v1'
);
