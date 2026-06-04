-- Logo « Sous l'égide du » — configurable depuis le tableau de bord admin
INSERT INTO public.site_banners (key, label)
VALUES ('ministry_egide', 'Logo — Sous l''égide du (bandeau accueil)')
ON CONFLICT (key) DO NOTHING;
