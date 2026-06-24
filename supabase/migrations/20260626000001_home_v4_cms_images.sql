-- CMS images — accueil home v4 (iframe)
INSERT INTO public.cms_images (key, label, category) VALUES
  ('home_v4_hero',             'Hero principal — photo d''accueil',         'sib2026'),
  ('home_v4_history_strip',    'Timeline 40 ans — bande photos',           'sib2026'),
  ('home_v4_ecosystem_globe',  'Écosystème BTP — globe central',             'sib2026'),
  ('home_v4_legacy_people',    'Bannière 40 ans d''héritage',              'sib2026'),
  ('home_v4_universes_strip',  '6 univers — bande photos',                 'sib2026'),
  ('home_v4_talks_stage',      'SIB Talks — scène / conférences',          'sib2026'),
  ('home_v4_quicklink_plan',   'Lien rapide — Plan interactif',            'sib2026'),
  ('home_v4_quicklink_exposer','Lien rapide — Exposer au SIB',             'sib2026'),
  ('home_v4_quicklink_visiter','Lien rapide — Visiter le salon',           'sib2026')
ON CONFLICT (key) DO NOTHING;

-- Reprendre les uploads legacy sur les nouvelles clés v4 quand pertinent
UPDATE public.cms_images AS v4
SET image_url = legacy.image_url,
    updated_at = GREATEST(v4.updated_at, legacy.updated_at)
FROM public.cms_images AS legacy
WHERE v4.image_url IS NULL
  AND legacy.image_url IS NOT NULL
  AND (
    (v4.key = 'home_v4_hero' AND legacy.key = 'sib2026_hero')
    OR (v4.key = 'home_v4_history_strip' AND legacy.key IN ('sib2026_timeline_1', 'sib2026_timeline_2'))
    OR (v4.key = 'home_v4_talks_stage' AND legacy.key = 'sib2026_salon_sib_talks')
    OR (v4.key = 'home_v4_quicklink_exposer' AND legacy.key = 'sib2026_salon_exposer')
    OR (v4.key = 'home_v4_quicklink_visiter' AND legacy.key = 'sib2026_salon_visiter')
    OR (v4.key = 'home_v4_quicklink_plan' AND legacy.key = 'sib2026_reserve')
  );

UPDATE public.cms_images SET category = 'sib2026_legacy'
WHERE key LIKE 'sib2026_%' AND category = 'sib2026';
