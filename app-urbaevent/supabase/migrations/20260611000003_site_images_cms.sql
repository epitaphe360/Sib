-- ============================================================
-- CMS : Images configurables du site (toutes pages)
-- Même pattern que site_banners
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cms_images (
  key        text PRIMARY KEY,
  label      text        NOT NULL,
  category   text        NOT NULL DEFAULT 'general',
  image_url  text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.cms_images IS 'Photos/images configurables par l''admin pour toutes les pages du site';
COMMENT ON COLUMN public.cms_images.key IS 'Identifiant unique (ex: home_hero_hall, sib40_portrait_0, builders_portrait_0)';
COMMENT ON COLUMN public.cms_images.category IS 'Groupe : home | sib40 | builders';
COMMENT ON COLUMN public.cms_images.image_url IS 'URL personnalisée (NULL = CDN par défaut)';

-- Seed avec toutes les clés connues (sans image_url → fallback CDN)
INSERT INTO public.cms_images (key, label, category) VALUES
  -- Pages d'accueil
  ('home_hero_hall',       'Hero principal — Hall exposition',        'home'),
  ('home_parc',            'Parc d''exposition El Jadida',            'home'),
  ('home_stand',           'Stand exposant',                          'home'),
  ('home_visitors',        'Visiteurs professionnels',                'home'),
  ('home_conferences',     'Conférences & panels',                    'home'),
  ('home_b2b',             'Réunions B2B',                            'home'),
  ('home_inauguration',    'Cérémonie d''inauguration',               'home'),
  ('home_international',   'Dimension internationale',                'home'),
  ('home_world_map',       'Carte du monde (partenaires)',            'home'),
  -- Page 40 ans
  ('sib40_hero',           'Hero — SIB 40 ans',                       'sib40'),
  ('sib40_portrait_0',     'Portrait 1 — timeline',                   'sib40'),
  ('sib40_portrait_1',     'Portrait 2 — timeline',                   'sib40'),
  ('sib40_portrait_2',     'Portrait 3 — timeline',                   'sib40'),
  ('sib40_portrait_3',     'Portrait 4 — timeline',                   'sib40'),
  ('sib40_timeline_1986',  'Photo édition 1986',                      'sib40'),
  ('sib40_timeline_2000',  'Photo édition 2000',                      'sib40'),
  ('sib40_timeline_2012',  'Photo édition 2012',                      'sib40'),
  ('sib40_timeline_2022',  'Photo édition 2022',                      'sib40'),
  ('sib40_timeline_2026',  'Photo édition 2026',                      'sib40'),
  -- Page Femmes & Hommes
  ('builders_portrait_0',  'Portrait — Architecte',                   'builders'),
  ('builders_portrait_1',  'Portrait — Ingénieur BTP',                'builders'),
  ('builders_portrait_2',  'Portrait — Designer d''intérieur',        'builders'),
  ('builders_portrait_3',  'Portrait — Chef de chantier',             'builders')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.cms_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cms images"    ON public.cms_images;
CREATE POLICY "Public read cms images"
  ON public.cms_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins write cms images"   ON public.cms_images;
CREATE POLICY "Admins write cms images"
  ON public.cms_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'));

-- ============================================================
-- CMS : Contenus texte configurables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cms_text_content (
  key        text PRIMARY KEY,
  label      text        NOT NULL,
  page       text        NOT NULL DEFAULT 'general',
  value_fr   text,
  value_en   text,
  value_ar   text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_text_content IS 'Textes modifiables par l''admin (titres, descriptions, CTAs)';

INSERT INTO public.cms_text_content (key, label, page, value_fr, value_en, value_ar) VALUES
  ('home_hero_kicker',   'Hero — accroche (petit texte)',      'home',     NULL, NULL, NULL),
  ('home_hero_headline', 'Hero — titre principal',             'home',     NULL, NULL, NULL),
  ('home_hero_date',     'Hero — date du salon',               'home',     NULL, NULL, NULL),
  ('home_hero_location', 'Hero — lieu',                        'home',     NULL, NULL, NULL),
  ('home_hero_cta_stand','Hero — bouton exposant',             'home',     NULL, NULL, NULL),
  ('home_hero_cta_visit','Hero — bouton visiteur',             'home',     NULL, NULL, NULL),
  ('home_stats_exhibitors',  'Stats — nombre exposants',       'home',     NULL, NULL, NULL),
  ('home_stats_visitors',    'Stats — nombre visiteurs',       'home',     NULL, NULL, NULL),
  ('home_stats_countries',   'Stats — pays représentés',       'home',     NULL, NULL, NULL),
  ('home_stats_conferences', 'Stats — conférences',            'home',     NULL, NULL, NULL)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.cms_text_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cms text"  ON public.cms_text_content;
CREATE POLICY "Public read cms text"
  ON public.cms_text_content FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins write cms text" ON public.cms_text_content;
CREATE POLICY "Admins write cms text"
  ON public.cms_text_content FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'));

-- Storage : bucket "images" doit accepter le dossier site-images/
-- (le bucket existe déjà via 20260601000004_site_banner_storage.sql)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
