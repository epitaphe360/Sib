-- ============================================================
-- Correction de la configuration salon SIB 2026
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'salon_config'
  ) THEN
    INSERT INTO salon_config (key, value)
    VALUES (
      'sib_2026',
      '{
        "name": "Salon International du Bâtiment",
        "name_ar": "المعرض الدولي للبناء",
        "slug": "sib-2026",
        "edition": "SIB 2026",
        "city": "El Jadida",
        "country": "Maroc",
        "venue": "Parc d Exposition Mohammed VI",
        "start_date": "2026-11-25",
        "end_date": "2026-11-29",
        "organizer": "Urbacom",
        "website": "https://www.sib.ma"
      }'::jsonb
    )
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = now();
  END IF;
END;
$$;
