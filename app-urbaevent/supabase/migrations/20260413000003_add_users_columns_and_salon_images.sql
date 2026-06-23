-- ============================================================
-- Migration : colonnes users manquantes + images salon SIB
-- Date      : 2026-04-13
-- ============================================================

-- =====================================================================
-- 1. AJOUT DES COLONNES MANQUANTES À LA TABLE USERS
-- =====================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS business_sector text DEFAULT '',
  ADD COLUMN IF NOT EXISTS job_position    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS country         text DEFAULT '';

COMMENT ON COLUMN public.users.business_sector IS 'Secteur d''activité du visiteur/exposant';
COMMENT ON COLUMN public.users.job_position    IS 'Poste / fonction';
COMMENT ON COLUMN public.users.country         IS 'Pays de résidence';

-- Vérifier que la colonne type existe (normalement présente depuis bootstrap)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.users ADD COLUMN type text DEFAULT 'visitor';
  END IF;
END $$;

-- Index pour les filtres courants
CREATE INDEX IF NOT EXISTS idx_users_type    ON public.users (type);
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users (country);

-- =====================================================================
-- 2. BUCKET STORAGE POUR LES ASSETS SALONS (logos, covers)
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-assets',
  'salon-assets',
  true,
  10485760,  -- 10 MB max
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Politique : lecture publique
DROP POLICY IF EXISTS "Public read salon assets" ON storage.objects;
CREATE POLICY "Public read salon assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'salon-assets');

-- Politique : upload réservé aux admins
DROP POLICY IF EXISTS "Admin upload salon assets" ON storage.objects;
CREATE POLICY "Admin upload salon assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'salon-assets'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- Politique : suppression réservée aux admins
DROP POLICY IF EXISTS "Admin delete salon assets" ON storage.objects;
CREATE POLICY "Admin delete salon assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'salon-assets'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- =====================================================================
-- 3. MISE A JOUR DES IMAGES DU SALON SIB
-- Les URLs pointent vers le bucket public salon-assets.
-- Après cette migration, uploadez les fichiers via le Dashboard Supabase :
--   Storage → salon-assets → sib/ → cover.jpg + logo.png
-- =====================================================================

UPDATE public.salons
SET
  cover_url = 'https://sbyizudifmqakzxjlndr.supabase.co/storage/v1/object/public/salon-assets/sib/cover.jpg',
  logo_url  = 'https://sbyizudifmqakzxjlndr.supabase.co/storage/v1/object/public/salon-assets/sib/logo.png',
  updated_at = now()
WHERE slug = 'sib';
