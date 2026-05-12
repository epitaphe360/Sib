-- Migration: Étendre badge_scans pour couvrir tous les types de scans
-- Unification en une seule table pour les statistiques de présence complètes
--
-- Types de scan :
--   venue_entry      → agent à l'entrée principale  (présence totale événement)
--   zone_entry       → agent à l'entrée d'une zone  (fréquentation par zone)
--   event_attendance → agent à l'entrée d'une salle (présence par conférence/atelier)
--   exhibitor_lead   → exposant qui scanne un visiteur (leads par exposant)

-- ── Nouvelles colonnes ───────────────────────────────────────────────────────

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS scan_type TEXT NOT NULL DEFAULT 'exhibitor_lead'
    CHECK (scan_type IN ('venue_entry', 'zone_entry', 'event_attendance', 'exhibitor_lead'));

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS zone_id TEXT;

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS access_result TEXT
    CHECK (access_result IN ('granted', 'denied', 'lead_captured'));

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS denial_reason TEXT;

-- Dénormalisation pour stats sans JOIN (perf dashboard)
ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS visitor_name TEXT;

ALTER TABLE public.badge_scans
  ADD COLUMN IF NOT EXISTS visitor_company TEXT;

-- ── Index pour requêtes statistiques ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS badge_scans_scan_type_idx      ON public.badge_scans (scan_type);
CREATE INDEX IF NOT EXISTS badge_scans_zone_id_idx        ON public.badge_scans (zone_id);
CREATE INDEX IF NOT EXISTS badge_scans_event_id_idx       ON public.badge_scans (event_id);
CREATE INDEX IF NOT EXISTS badge_scans_access_result_idx  ON public.badge_scans (access_result);

-- ── Mise à jour RLS ──────────────────────────────────────────────────────────

-- Remplacer la policy admin (compatible avec type = 'admin')
DROP POLICY IF EXISTS "Admin accès complet badge_scans" ON public.badge_scans;
CREATE POLICY "Admin accès complet badge_scans"
  ON public.badge_scans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ── Vues statistiques utiles ─────────────────────────────────────────────────

-- Vue : présence totale événement (venue_entry uniques)
CREATE OR REPLACE VIEW public.stats_event_attendance AS
SELECT
  DATE(scanned_at) AS scan_date,
  COUNT(*)                                    AS total_scans,
  COUNT(DISTINCT visitor_id)                  AS unique_visitors
FROM public.badge_scans
WHERE scan_type = 'venue_entry'
  AND access_result = 'granted'
GROUP BY DATE(scanned_at);

-- Vue : fréquentation par zone
CREATE OR REPLACE VIEW public.stats_zone_attendance AS
SELECT
  zone_id,
  COUNT(*)                                    AS total_scans,
  COUNT(DISTINCT visitor_id)                  AS unique_visitors,
  COUNT(*) FILTER (WHERE access_result = 'granted')  AS granted,
  COUNT(*) FILTER (WHERE access_result = 'denied')   AS denied
FROM public.badge_scans
WHERE scan_type = 'zone_entry'
GROUP BY zone_id;

-- Vue : présence par conférence/atelier
CREATE OR REPLACE VIEW public.stats_event_session_attendance AS
SELECT
  event_id,
  COUNT(*)                                    AS total_scans,
  COUNT(DISTINCT visitor_id)                  AS unique_attendees
FROM public.badge_scans
WHERE scan_type = 'event_attendance'
  AND access_result = 'granted'
GROUP BY event_id;

-- Vue : leads par exposant
CREATE OR REPLACE VIEW public.stats_exhibitor_leads AS
SELECT
  scanned_by                                  AS exhibitor_id,
  COUNT(*)                                    AS total_scans,
  COUNT(DISTINCT visitor_id)                  AS unique_visitors
FROM public.badge_scans
WHERE scan_type = 'exhibitor_lead'
GROUP BY scanned_by;
