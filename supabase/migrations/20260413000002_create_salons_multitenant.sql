-- ============================================================
-- Architecture multi-tenant : table salons + salon_id FK
-- SIB = premier salon par défaut
-- Les autres tables reçoivent salon_id nullable (NULL = SIB)
-- ============================================================

-- =====================================================================
-- 1. TABLE SALONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.salons (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  logo_url      text,
  cover_url     text,
  description   text,
  location      text,
  date_debut    date,
  date_fin      date,
  is_active     boolean NOT NULL DEFAULT true,
  is_default    boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  config        jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS salons_updated_at ON public.salons;
CREATE TRIGGER salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Un seul salon peut être le salon par défaut
CREATE UNIQUE INDEX IF NOT EXISTS salons_one_default ON public.salons (is_default)
  WHERE is_default = true;

-- RLS sur salons
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salons_select_all" ON public.salons;
CREATE POLICY "salons_select_all"
  ON public.salons FOR SELECT USING (true);

DROP POLICY IF EXISTS "salons_write_admin" ON public.salons;
CREATE POLICY "salons_write_admin"
  ON public.salons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- Insérer SIB comme premier salon (par défaut)
INSERT INTO public.salons (name, slug, description, location, date_debut, date_fin, is_active, is_default, sort_order)
VALUES (
  'Salon International du Bâtiment (SIB)',
  'sib',
  'Premier salon professionnel du bâtiment au Maroc',
  'Office des Foires et Expositions de Casablanca (OFEC)',
  '2026-10-01',
  '2026-10-04',
  true,
  true,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- 2. AJOUT DE salon_id AUX TABLES EXISTANTES
-- Colonne nullable → NULL = appartient au salon par défaut (SIB)
-- FK en DEFERRABLE pour compatibilité avec les données existantes
-- =====================================================================

-- exhibitors
ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES public.salons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitors_salon_id ON public.exhibitors (salon_id);

-- partners
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES public.salons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_partners_salon_id ON public.partners (salon_id);

-- speakers
ALTER TABLE public.speakers
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES public.salons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_speakers_salon_id ON public.speakers (salon_id);

-- event_registrations
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES public.salons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_event_registrations_salon_id ON public.event_registrations (salon_id);

-- page_contents (contenu CMS par salon)
ALTER TABLE public.page_contents
  ADD COLUMN IF NOT EXISTS salon_id uuid REFERENCES public.salons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_page_contents_salon_id ON public.page_contents (salon_id);

-- users (pour les super-admins Urbacom qui peuvent administrer plusieurs salons)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS managed_salons uuid[] DEFAULT '{}';

-- =====================================================================
-- 3. RLS AMÉLIORÉES : filtrage par salon_id
-- Règle : NULL salon_id → appartient au salon par défaut  
-- =====================================================================

-- Helper function: récupère le salon_id par défaut
CREATE OR REPLACE FUNCTION public.get_default_salon_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.salons WHERE is_default = true LIMIT 1;
$$;

-- Helper function: vérifie si un utilisateur est admin d'un salon donné
CREATE OR REPLACE FUNCTION public.is_salon_admin(p_salon_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND (
        type = 'admin'
        OR (p_salon_id = ANY(managed_salons))
      )
  );
$$;

-- =====================================================================
-- 4. INDEX DE PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_salons_slug       ON public.salons (slug);
CREATE INDEX IF NOT EXISTS idx_salons_is_active  ON public.salons (is_active);
CREATE INDEX IF NOT EXISTS idx_salons_is_default ON public.salons (is_default);
