-- Migration: création de la table badge_scans
-- Stocke tous les scans QR effectués par les exposants et leurs collaborateurs.
-- Les données sont insérées par offlineSyncService.ts (sync offline → online).

CREATE TABLE IF NOT EXISTS public.badge_scans (
  id           TEXT PRIMARY KEY,                       -- généré côté client: scan_{timestamp}_{random}
  visitor_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scanned_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location     TEXT,                                   -- ex: "Entrée A", "Stand B12"
  badge_type   TEXT NOT NULL DEFAULT 'visitor'         -- visitor | exhibitor | partner | vip | press
    CHECK (badge_type IN ('visitor','exhibitor','partner','vip','press'))
);

-- Index pour les requêtes par scanner (dashboard exposant)
CREATE INDEX IF NOT EXISTS badge_scans_scanned_by_idx ON public.badge_scans (scanned_by);
-- Index pour les requêtes par visiteur
CREATE INDEX IF NOT EXISTS badge_scans_visitor_id_idx ON public.badge_scans (visitor_id);
-- Index chronologique
CREATE INDEX IF NOT EXISTS badge_scans_scanned_at_idx ON public.badge_scans (scanned_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.badge_scans ENABLE ROW LEVEL SECURITY;

-- Un exposant (et ses collaborateurs) peuvent LIRE leurs propres scans.
-- La logique collaborateur est gérée côté app (liste d'IDs).
-- Pour simplifier, un user peut lire les scans où il est scanneur.
CREATE POLICY "Exposant voit ses scans"
  ON public.badge_scans FOR SELECT
  USING (scanned_by = auth.uid());

-- Un user peut insérer un scan uniquement en son propre nom.
CREATE POLICY "Exposant insère ses scans"
  ON public.badge_scans FOR INSERT
  WITH CHECK (scanned_by = auth.uid());

-- Un user peut supprimer ses propres scans.
CREATE POLICY "Exposant supprime ses scans"
  ON public.badge_scans FOR DELETE
  USING (scanned_by = auth.uid());

-- Les admins ont accès complet (via service role ou rôle admin).
CREATE POLICY "Admin accès complet badge_scans"
  ON public.badge_scans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin','super_admin')
    )
  );
