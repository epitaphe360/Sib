-- Bannières du site (accueil, UrbaEvent, etc.)
CREATE TABLE IF NOT EXISTS public.site_banners (
  key text PRIMARY KEY,
  label text NOT NULL,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_banners IS 'Bannières configurables du site public';

INSERT INTO public.site_banners (key, label)
VALUES
  ('urbaevent', 'Bannière UrbaEvent (page d''accueil)'),
  ('ministry_egide', 'Logo — Sous l''égide du (bandeau accueil)')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site banners" ON public.site_banners;
CREATE POLICY "Public read site banners"
  ON public.site_banners
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins insert site banners" ON public.site_banners;
CREATE POLICY "Admins insert site banners"
  ON public.site_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins update site banners" ON public.site_banners;
CREATE POLICY "Admins update site banners"
  ON public.site_banners
  FOR UPDATE
  TO authenticated
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

DROP POLICY IF EXISTS "Admins delete site banners" ON public.site_banners;
CREATE POLICY "Admins delete site banners"
  ON public.site_banners
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );
