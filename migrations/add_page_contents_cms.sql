-- ====================================================
-- CMS : table page_contents
-- Permet à l'admin d'éditer le contenu des pages vitrine
-- depuis le tableau de bord administrateur.
-- ====================================================
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/sql/new
-- ====================================================

-- 1. Créer la table
CREATE TABLE IF NOT EXISTS public.page_contents (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug   TEXT        NOT NULL UNIQUE,
  content     JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.page_contents IS 'Contenu éditable des pages vitrine du site SIB, géré depuis le tableau de bord admin.';

-- 2. Index pour les lookups par slug
CREATE INDEX IF NOT EXISTS page_contents_slug_idx ON public.page_contents(page_slug);

-- 3. Trigger : mise à jour auto de updated_at
CREATE OR REPLACE FUNCTION public.update_page_contents_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_page_contents_updated_at ON public.page_contents;
CREATE TRIGGER trg_page_contents_updated_at
  BEFORE UPDATE ON public.page_contents
  FOR EACH ROW EXECUTE FUNCTION public.update_page_contents_updated_at();

-- 4. RLS
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire (pages publiques)
CREATE POLICY "page_contents_public_read"
  ON public.page_contents
  FOR SELECT
  USING (true);

-- Seuls les admins peuvent créer / modifier / supprimer
-- (is_admin doit avoir SET row_security = off — voir fix-rls-recursion-users.sql)
CREATE POLICY "page_contents_admin_write"
  ON public.page_contents
  FOR ALL
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())::uuid))
  WITH CHECK (public.is_admin((SELECT auth.uid())::uuid));

-- 5. Grants
GRANT SELECT ON public.page_contents TO anon;
GRANT SELECT ON public.page_contents TO authenticated;
GRANT ALL    ON public.page_contents TO service_role;
