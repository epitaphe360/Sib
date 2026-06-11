-- Migration : ajouter les clés d'images sib2026 dans cms_images
-- Pages Accueil SIB 2026 (P1–P8) : hero, mission/timeline × 5, reserve, cartes salon × 6

INSERT INTO public.cms_images (key, label, category) VALUES
  ('sib2026_hero',               'Hero principal — Hall SIB 2026',     'sib2026'),
  ('sib2026_timeline_1',         'Photo mission / timeline 1',          'sib2026'),
  ('sib2026_timeline_2',         'Photo mission / timeline 2',          'sib2026'),
  ('sib2026_timeline_3',         'Photo mission / timeline 3',          'sib2026'),
  ('sib2026_timeline_4',         'Photo mission / timeline 4',          'sib2026'),
  ('sib2026_timeline_5',         'Photo timeline 5 — 2026',             'sib2026'),
  ('sib2026_reserve',            'Bannière Réserver — Parc El Jadida',  'sib2026'),
  ('sib2026_salon_exposer',      'Carte Salon — Exposer',               'sib2026'),
  ('sib2026_salon_visiter',      'Carte Salon — Visiter',               'sib2026'),
  ('sib2026_salon_sib_talks',    'Carte Salon — SIB Talks',             'sib2026'),
  ('sib2026_salon_b2b',          'Carte Salon — Meetings B2B',          'sib2026'),
  ('sib2026_salon_diner',        'Carte Salon — Dîner Officiel',        'sib2026'),
  ('sib2026_salon_international','Carte Salon — International',         'sib2026')
ON CONFLICT (key) DO NOTHING;
