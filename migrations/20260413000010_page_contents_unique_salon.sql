-- ============================================================
-- Contrainte unique composite pour CMS multi-salon
-- Nécessaire pour l'upsert ON CONFLICT (page_slug, salon_id)
-- ============================================================

-- Index unique pour les contenus liés à un salon spécifique
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_contents_slug_salon
  ON public.page_contents (page_slug, salon_id)
  WHERE salon_id IS NOT NULL;

-- Index unique pour les contenus du salon par défaut (salon_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_contents_slug_default
  ON public.page_contents (page_slug)
  WHERE salon_id IS NULL;
