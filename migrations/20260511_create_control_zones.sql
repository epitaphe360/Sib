-- Migration: Table control_zones
-- Remplace le localStorage pour que les zones définies par l'admin
-- soient partagées entre tous les appareils (agents de sécurité, scanners, etc.)

CREATE TABLE IF NOT EXISTS public.control_zones (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '📍',
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_control_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS control_zones_updated_at ON public.control_zones;
CREATE TRIGGER control_zones_updated_at
  BEFORE UPDATE ON public.control_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_control_zones_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.control_zones ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur authentifié peut lire les zones (agents de sécurité, exposants, etc.)
CREATE POLICY "control_zones_select_authenticated"
  ON public.control_zones FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seuls les admins peuvent créer, modifier, supprimer
CREATE POLICY "control_zones_admin_all"
  ON public.control_zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ── Seed des zones par défaut ───────────────────────────────────────────────
-- ON CONFLICT DO NOTHING : ne remplace pas les zones déjà personnalisées par l'admin
INSERT INTO public.control_zones (id, name, icon, description, created_at, updated_at) VALUES
  ('public',          'Zone Publique',      '🌐', 'Accès libre au grand public',                  '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('exhibition_hall', 'Hall d''Exposition', '🏛️', 'Espace principal des exposants',               '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('vip_lounge',      'Salon VIP',          '⭐', 'Espace réservé aux visiteurs VIP',              '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('networking_area', 'Zone Networking',    '🤝', 'Espace de mise en relation B2B',                '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('backstage',       'Backstage',          '🎭', 'Zone technique et organisateurs',               '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('partner_area',    'Zone Sponsors',      '💼', 'Espace réservé aux sponsors et partenaires',    '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('exhibitor_area',  'Zone Exposants',     '🏢', 'Espace back-office des exposants',              '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('technical_area',  'Zone Technique',     '🔧', 'Infrastructure et support technique',           '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
