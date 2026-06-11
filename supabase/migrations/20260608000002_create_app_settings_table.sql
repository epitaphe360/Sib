-- ============================================================
-- Table app_settings — configuration globale de l'app SIB 2026
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Lecture app_settings authentifiée" ON app_settings;
DROP POLICY IF EXISTS "Tous les utilisateurs authentifiés lisent app_settings" ON app_settings;
CREATE POLICY "app_settings_authenticated_read"
  ON app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Écriture admin (conditionnelle selon existence de users)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'app_settings_admin'
  ) THEN
    CREATE POLICY "app_settings_admin"
      ON app_settings FOR ALL
      USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'));
  END IF;
END;
$$;

-- Configuration initiale badge A4 SIB 2026
INSERT INTO app_settings (key, value) VALUES
(
  'badge_config',
  '{
    "eventName": "Salon International du Bâtiment",
    "eventNameAr": "المعرض الدولي للبناء",
    "eventSubtitle": "SIB 2026",
    "venue": "Parc d Exposition Mohammed VI",
    "city": "El Jadida, Maroc",
    "dates": "25-29 novembre 2026",
    "organizer": "Urbacom",
    "website": "www.sib.ma",
    "primaryColor": "#1B365D",
    "accentColor": "#D4AF37",
    "program_days": [
      { "date": "2026-11-25", "label": "Jour 1 - Ouverture officielle" },
      { "date": "2026-11-26", "label": "Jour 2 - Innovation & Matériaux" },
      { "date": "2026-11-27", "label": "Jour 3 - Urbanisme durable" },
      { "date": "2026-11-28", "label": "Jour 4 - BIM & Numérique" },
      { "date": "2026-11-29", "label": "Jour 5 - Clôture & Networking" }
    ],
    "partners_top": ["Ministère de l Habitat", "CCIS Maroc", "Région Casablanca-Settat"],
    "logo_url": null
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = now();
