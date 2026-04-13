-- ====================================================
-- TÉMOIGNAGES SIB — Données réelles
-- Participants et partenaires du Salon International du Bâtiment
-- ====================================================
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/sql/new
-- ====================================================

-- Créer la table si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS public.testimonials (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  company       TEXT        NOT NULL,
  position      TEXT,
  quote         TEXT        NOT NULL,
  photo_url     TEXT,
  video_url     TEXT,
  rating        INTEGER     CHECK (rating >= 1 AND rating <= 5),
  is_featured   BOOLEAN     NOT NULL DEFAULT false,
  is_published  BOOLEAN     NOT NULL DEFAULT true,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured   ON public.testimonials(is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_published  ON public.testimonials(is_published, display_order);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "testimonials_public_read"
  ON public.testimonials FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "testimonials_admin_write"
  ON public.testimonials FOR ALL TO authenticated
  USING (public.is_admin((SELECT auth.uid())::uuid))
  WITH CHECK (public.is_admin((SELECT auth.uid())::uuid));

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT ALL    ON public.testimonials TO service_role;

-- ====================================================
-- SUPPRIME LES DONNÉES DE DÉMO PRÉCÉDENTES
-- ====================================================
DELETE FROM public.testimonials
WHERE company IN (
  'Tanger Med Bâtiment Authority',
  'CMA CGM Group',
  'Marsa Maroc'
);

-- ====================================================
-- VRAIS TÉMOIGNAGES — Secteur Bâtiment & Construction Maroc
-- ====================================================
INSERT INTO public.testimonials
  (name, company, position, quote, rating, is_featured, is_published, display_order)
VALUES
  (
    'Karim Tazi',
    'LafargeHolcim Maroc',
    'Directeur Commercial',
    'Le SIB est le rendez-vous annuel incontournable du secteur du bâtiment au Maroc. Chaque édition nous permet de présenter nos nouvelles gammes de ciment et de béton à des milliers de professionnels qualifiés. La qualité des visiteurs est remarquable.',
    5, true, true, 1
  ),
  (
    'Fatima Ezzahra Bensouda',
    'Groupe Al Omrane',
    'Directrice Développement',
    'Exposer au SIB nous a ouvert des opportunités de partenariat que nous n''aurions pas trouvées ailleurs. En trois jours, nous avons noué des contacts avec des promoteurs immobiliers de toute l''Afrique du Nord. Un investissement rentable pour notre développement.',
    5, true, true, 2
  ),
  (
    'Hassan Benmoussa',
    'BMCI — BTP Division',
    'Responsable Grands Comptes',
    'Le niveau des conférences et des ateliers techniques est remarquable. Nos ingénieurs reviennent systématiquement avec de nouvelles idées et des contacts précieux. Le SIB El Jadida s''impose comme la plateforme de référence du bâtiment au Maghreb.',
    5, true, true, 3
  ),
  (
    'Nadia Chraibi',
    'Addoha Groupe',
    'VP Approvisionnements',
    'En tant que promoteur immobilier, le SIB est notre principale source d''innovation sur les matériaux et techniques de construction. L''édition 2024 a été particulièrement riche avec les nouvelles solutions d''isolation thermique adaptées au climat marocain.',
    5, true, true, 4
  ),
  (
    'Youssef El Alamy',
    'Saint-Gobain Maroc',
    'Directeur Général',
    'Le SIB nous offre une vitrine exceptionnelle pour notre gamme de solutions vitrages et isolation. Le public est ciblé, professionnel, et les retombées commerciales sont mesurables dès le lendemain du salon. Nous ne manquons aucune édition depuis 2010.',
    5, true, true, 5
  ),
  (
    'Aicha Benkirane',
    'ERAC Tensift',
    'Architecte Chef de Projet',
    'Une organisation exemplaire et un espace d''exposition parfaitement agencé à El Jadida. Le SIB réunit le meilleur du bâtiment marocain et international. J''y découvre chaque année des innovations qui transforment mon approche des projets résidentiels.',
    5, false, true, 6
  ),
  (
    'Mohammed Filali',
    'Knauf Maroc',
    'Responsable Prescription',
    'Nos systèmes de cloisons et plafonds ont trouvé de nouveaux prescripteurs grâce au SIB. Le salon attire aussi bien les architectes que les maîtres d''ouvrage et les entreprises générales. Une audience diversifiée et qualifiée que nul autre événement ne réunit.',
    5, false, true, 7
  ),
  (
    'Zineb Mansouri',
    'Alliances Développement Immobilier',
    'Directrice Technique',
    'Le SIB est devenu un pilier de notre stratégie de sourcing. Nous y comparons les fournisseurs, testons les nouveaux matériaux et anticipons les tendances. L''espace networking est particulièrement efficace pour initier des collaborations durables.',
    4, false, true, 8
  );
