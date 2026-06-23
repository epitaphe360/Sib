-- Audit mobile 2026-06-15 : durcissements post-RLS

-- 1. is_admin() sans récursion résiduelle
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND type = 'admin'
  );
$$;

-- 2. Actualités : lire is_published OU published (legacy)
DROP POLICY IF EXISTS "Anyone can read published news" ON public.news_articles;
DROP POLICY IF EXISTS "Public can read published news" ON public.news_articles;

CREATE POLICY "Anyone can read published news"
  ON public.news_articles FOR SELECT
  TO anon, authenticated
  USING (
    COALESCE(is_published, published, false) = true
  );

-- 3. floor_plan_url sur salons (déjà utilisé côté mobile)
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;

-- 4. mini_sites : colonnes optionnelles lues par l'app
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.mini_sites ADD COLUMN IF NOT EXISTS primary_color TEXT;
