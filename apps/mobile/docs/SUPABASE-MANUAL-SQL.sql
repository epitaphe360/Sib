-- =============================================================================
-- SIB — SQL manuel Supabase (Dashboard → SQL Editor)
-- Projet: sbyizudifmqakzxjlndr
-- Executer bloc par bloc OU tout le fichier (idempotent)
-- =============================================================================


-- ========== supabase\migrations\20260602000001_mobile_exhibitor_leads_and_realtime.sql ==========

-- Mobile app: exhibitor lead capture + Realtime for push listeners

-- ============================================================
-- exhibitor_leads â€” scans contacts au stand (app mobile exposant)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exhibitor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  badge_code text,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_exhibitor ON public.exhibitor_leads (exhibitor_user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_scanned_at ON public.exhibitor_leads (scanned_at DESC);

ALTER TABLE public.exhibitor_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exhibitors can view own leads" ON public.exhibitor_leads;
CREATE POLICY "Exhibitors can view own leads"
  ON public.exhibitor_leads FOR SELECT
  USING (auth.uid() = exhibitor_user_id);

DROP POLICY IF EXISTS "Exhibitors can insert own leads" ON public.exhibitor_leads;
CREATE POLICY "Exhibitors can insert own leads"
  ON public.exhibitor_leads FOR INSERT
  WITH CHECK (auth.uid() = exhibitor_user_id);

DROP POLICY IF EXISTS "Admins can manage all exhibitor leads" ON public.exhibitor_leads;
CREATE POLICY "Admins can manage all exhibitor leads"
  ON public.exhibitor_leads FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

GRANT SELECT, INSERT ON public.exhibitor_leads TO authenticated;

COMMENT ON TABLE public.exhibitor_leads IS 'Contacts visiteurs scannÃ©s par les exposants (app mobile)';

-- ============================================================
-- Realtime â€” notifications locales mobile (RDV, messages, admin)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'registration_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_requests;
  END IF;
END $$;

-- ========== supabase\migrations\20260411000002_insert_official_partners.sql ==========

-- Migration: Insertion des partenaires officiels du SIB 2026
-- Date: 2026-04-11
-- Description: Ajout des 6 partenaires institutionnels officiels avec profils complets

BEGIN;

-- S'assurer que les colonnes enhanced existent (dÃ©pendances de 20251229_enhance_partners_table)
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS mission text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS vision text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS established_year integer;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS employees text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- =======================================================
-- 1. MinistÃ¨re de l'AmÃ©nagement du Territoire National,
--    de l'Urbanisme, de l'Habitat et de la Politique de la Ville
--    RÃ´le : Co-organisateur
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  NULL,
  'MinistÃ¨re de l''AmÃ©nagement du Territoire National, de l''Urbanisme, de l''Habitat et de la Politique de la Ville',
  'government',
  'Urbanisme & Habitat',
  'Le MinistÃ¨re chargÃ© de l''Urbanisme et de l''Habitat est responsable de la conception et de la mise en Å“uvre des politiques nationales en matiÃ¨re d''amÃ©nagement du territoire, d''urbanisme, de logement et de dÃ©veloppement urbain durableour. Ã€ la tÃªte du salon SIB 2026, il incarne l''engagement de l''Ã‰tat marocain pour un habitat inclusif, durable et de qualitÃ©.',
  '/logo-ministere.png',
  'https://www.mhpv.gov.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Ã‰laborer et mettre en Å“uvre une politique nationale intÃ©grÃ©e en matiÃ¨re d''amÃ©nagement du territoire, d''urbanisme, de logement et de politique de la ville, au service d''un dÃ©veloppement durable, Ã©quilibrÃ© et inclusif.',
  'Un Maroc dont les villes et les territoires sont des espaces de vie harmonieux, durables et attractifs, offrant Ã  tous les citoyens un cadre de vie de qualitÃ© et un accÃ¨s Ã©quitable au logement.',
  '["Ã‰quitÃ© territoriale", "DurabilitÃ©", "Innovation urbaine", "Participation citoyenne", "QualitÃ© architecturale", "CohÃ©sion sociale"]'::jsonb,
  '["Politique du logement", "Planification urbaine", "RÃ©habilitation des quartiers", "Villes durables", "Habitat social", "RÃ©glementation de la construction", "Politique de la ville"]'::jsonb,
  '[
    {"label": "UnitÃ©s de logement produites annuellement", "value": "100 000+", "icon": "Home"},
    {"label": "Villes couvertes", "value": "200+", "icon": "MapPin"},
    {"label": "Budget annuel (MMDH)", "value": "8+", "icon": "TrendingUp"},
    {"label": "Programmes de logement actifs", "value": "15+", "icon": "Building"}
  ]'::jsonb,
  '{"website": "https://www.mhpv.gov.ma", "facebook": "https://www.facebook.com/muat.gov.ma"}'::jsonb,
  1956,
  '5000+',
  '{"email": "contact@mhpv.gov.ma", "phone": "+212 5 37 21 17 00", "address": "Avenue Ibn Sina, Agdal, Rabat, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =======================================================
-- 2. AMDIE â€” Agence Marocaine de DÃ©veloppement
--    des Investissements et des Exportations
--    RÃ´le : Co-organisateur
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  certifications,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  NULL,
  'AMDIE â€” Agence Marocaine de DÃ©veloppement des Investissements et des Exportations',
  'institutional',
  'Investissement & Commerce International',
  'L''AMDIE est l''organisme national chargÃ© de promouvoir les investissements nationaux et Ã©trangers ainsi que le dÃ©veloppement des exportations marocaines. CrÃ©Ã©e en 2017 par la fusion de l''AMDI, Maroc Export et l''OFEC, elle constitue un guichet unique pour les investisseurs et pilote la marque stratÃ©gique Â«Morocco NowÂ». Partenaire incontournable du SIB 2026 pour attirer les investissements dans le secteur de la construction et du BTP.',
  '/logos/amdie.png',
  'https://www.amdie.gov.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Promouvoir le Maroc comme destination d''investissement de premier rang et accompagner les entreprises marocaines Ã  l''international, en s''appuyant sur la stratÃ©gie Â«Morocco NowÂ» pour positionner le Royaume comme un hub industriel et logistique compÃ©titif.',
  'Faire du Maroc un pÃ´le d''attractivitÃ© mondial pour l''investissement et un champion des exportations africaines, contribuant Ã  une croissance Ã©conomique durable et Ã  la crÃ©ation d''emplois qualifiÃ©s.',
  '["Innovation", "EfficacitÃ©", "Transparence", "Partenariat public-privÃ©", "CompÃ©titivitÃ©", "DurabilitÃ©"]'::jsonb,
  '["Promotion des investissements Ã©trangers", "DÃ©veloppement des exportations", "Organisation de foires et expositions", "Accompagnement des investisseurs", "Intelligence Ã©conomique", "Partenariats stratÃ©giques internationaux"]'::jsonb,
  '[
    {"label": "Projets d''investissement approuvÃ©s en 2025 (MMDH)", "value": "110+", "icon": "TrendingUp"},
    {"label": "Actions de promotion menÃ©es en 2025", "value": "55+", "icon": "Globe"},
    {"label": "Pays couverts", "value": "80+", "icon": "MapPin"},
    {"label": "Emplois gÃ©nÃ©rÃ©s", "value": "50 000+", "icon": "Users"}
  ]'::jsonb,
  '{"linkedin": "https://www.linkedin.com/company/amdie", "twitter": "https://twitter.com/AMDIE_MA", "facebook": "https://www.facebook.com/amdie.gov.ma", "youtube": "https://www.youtube.com/@amdie_maroc"}'::jsonb,
  '["ISO 9001:2015"]'::jsonb,
  2017,
  '200-500',
  '{"email": "info@amdie.gov.ma", "phone": "+212 5 22 77 47 00", "address": "Tour Hassan II, Casablanca, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =======================================================
-- 3. FMC â€” FÃ©dÃ©ration des Industries des MatÃ©riaux
--    de Construction
--    RÃ´le : Co-organisateur
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  NULL,
  'FMC â€” FÃ©dÃ©ration des Industries des MatÃ©riaux de Construction',
  'institutional',
  'MatÃ©riaux de Construction',
  'La FMC reprÃ©sente l''ensemble des industries productrices de matÃ©riaux de construction au Maroc : ciment, bÃ©ton, cÃ©ramique, plÃ¢tre, briques, verre, acier et autres matÃ©riaux de second Å“uvre. Elle joue un rÃ´le clÃ© dans la structuration de la filiÃ¨re, la promotion de l''innovation et le dialogue avec les pouvoirs publics. Partenaire co-organisateur du SIB 2026, elle mobilise tout l''Ã©cosystÃ¨me industriel au service de l''habitat.',
  '/logos/fmc.png',
  'https://fmc.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'FÃ©dÃ©rer, reprÃ©senter et dÃ©fendre les intÃ©rÃªts des industries marocaines des matÃ©riaux de construction, tout en promouvant l''innovation, la qualitÃ© et la durabilitÃ© au sein de la filiÃ¨re.',
  'Positionner l''industrie marocaine des matÃ©riaux de construction comme un acteur de rÃ©fÃ©rence Ã  l''Ã©chelle africaine, capable de rÃ©pondre aux enjeux du logement abordable et durable.',
  '["QualitÃ©", "Innovation", "DurabilitÃ©", "SolidaritÃ© professionnelle", "Performance industrielle"]'::jsonb,
  '["Ciment et bÃ©ton", "CÃ©ramique et carrelage", "Acier de construction", "Verre architectural", "Isolation thermique et acoustique", "MatÃ©riaux de second Å“uvre", "Normalisation et certification"]'::jsonb,
  '[
    {"label": "Entreprises membres", "value": "150+", "icon": "Building"},
    {"label": "Chiffre d''affaires annuel (MMDH)", "value": "40+", "icon": "TrendingUp"},
    {"label": "Emplois directs", "value": "60 000+", "icon": "Users"},
    {"label": "CapacitÃ© ciment (Mt/an)", "value": "20+", "icon": "Package"}
  ]'::jsonb,
  '{"linkedin": "https://www.linkedin.com/company/fmc-maroc", "facebook": "https://www.facebook.com/fmc.maroc"}'::jsonb,
  1990,
  '100-200',
  '{"email": "contact@fmc.ma", "phone": "+212 5 22 24 90 00", "address": "Casablanca, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =======================================================
-- 4. FNBTP â€” FÃ©dÃ©ration Nationale du BÃ¢timent
--    et des Travaux Publics
--    RÃ´le : Co-organisateur
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  certifications,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  NULL,
  'FNBTP â€” FÃ©dÃ©ration Nationale du BÃ¢timent et des Travaux Publics',
  'institutional',
  'BTP',
  'La FNBTP est l''organisation professionnelle centrale des entreprises marocaines du BÃ¢timent et des Travaux Publics. Forte de plus de quatre dÃ©cennies d''existence, elle reprÃ©sente des milliers d''entreprises, grandes, moyennes et petites, auprÃ¨s des autoritÃ©s publiques et des institutions. Avec une contribution de 6,2 % du PIB national et 1,2 million d''emplois, le secteur BTP est l''un des piliers de l''Ã©conomie marocaine. Partenaire co-organisateur du SIB 2026.',
  '/logos/fnbtp.png',
  'https://fnbtp.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'ReprÃ©senter, dÃ©fendre et promouvoir les entreprises du BTP marocain, favoriser un environnement rÃ©glementaire et Ã©conomique propice Ã  leur dÃ©veloppement, et contribuer Ã  l''Ã©lÃ©vation des standards de qualitÃ©, d''Ã©thique et de performance du secteur.',
  'Un secteur du BTP marocain compÃ©titif, innovant et durable, reconnu Ã  l''Ã©chelle africaine et internationale pour sa capacitÃ© Ã  livrer des projets d''excellence.',
  '["Ã‰thique professionnelle", "Ã‰quitÃ©", "QualitÃ©", "Performance", "Formation continue", "Innovation"]'::jsonb,
  '["BÃ¢timent rÃ©sidentiel et commercial", "Travaux publics et infrastructure", "GÃ©nie civil", "Qualification et classification des entreprises", "Formation professionnelle BTP", "Veille rÃ©glementaire et marchÃ©s publics", "DÃ©veloppement durable dans la construction"]'::jsonb,
  '[
    {"label": "% du PIB national", "value": "6,2 %", "icon": "TrendingUp"},
    {"label": "Emplois gÃ©nÃ©rÃ©s", "value": "1,2 M", "icon": "Users"},
    {"label": "% de la FBCF", "value": "55 %", "icon": "BarChart"},
    {"label": "Taux de croissance sectoriel", "value": "6,7 %", "icon": "ArrowUp"}
  ]'::jsonb,
  '{"linkedin": "https://www.linkedin.com/company/fnbtp", "twitter": "https://x.com/fnbtp", "facebook": "https://facebook.com/FNBTP", "youtube": "https://youtube.com/@FNBTP_Maroc"}'::jsonb,
  '["ISO 9001:2015"]'::jsonb,
  1978,
  '100-200',
  '{"email": "contact@fnbtp.ma", "phone": "+212 5 22 27 42 49", "address": "Rabat, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =======================================================
-- 5. LAP â€” Sponsor Officiel
--    Logo rouge avec icÃ´ne prise Ã©lectrique
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  NULL,
  'LAP',
  'corporate',
  'Solutions Techniques & Ã‰quipements',
  'LAP est un acteur spÃ©cialisÃ© dans la fourniture de solutions techniques pour le bÃ¢timent et l''industrie. Expert en Ã©quipements Ã©lectriques, alimentation en Ã©nergie et solutions de connexion pour les professionnels du BTP et de l''amÃ©nagement, LAP est sponsor officiel du SIB 2026 et contribue Ã  l''excellence technique du salon.',
  '/logos/lap.png',
  'https://lap.ma',
  'Maroc',
  true,
  true,
  'sponsor-officiel',
  'Fournir aux professionnels du bÃ¢timent et de l''industrie des solutions techniques innovantes, fiables et performantes, en mettant l''accent sur la qualitÃ© et le service client.',
  'ÃŠtre la rÃ©fÃ©rence marocaine des solutions techniques pour la construction, en proposant une gamme complÃ¨te de produits Ã  forte valeur ajoutÃ©e.',
  '["FiabilitÃ©", "Innovation technique", "QualitÃ©", "Service client", "DurabilitÃ©"]'::jsonb,
  '["Ã‰quipements Ã©lectriques", "Solutions d''alimentation", "MatÃ©riel de connexion", "Solutions pour le bÃ¢timent", "Distribution d''Ã©quipements techniques"]'::jsonb,
  '[
    {"label": "AnnÃ©es d''expÃ©rience", "value": "20+", "icon": "Calendar"},
    {"label": "RÃ©fÃ©rences clients", "value": "500+", "icon": "Users"},
    {"label": "Produits au catalogue", "value": "10 000+", "icon": "Package"},
    {"label": "RÃ©gions couvertes", "value": "12", "icon": "MapPin"}
  ]'::jsonb,
  '{"linkedin": "https://www.linkedin.com/company/lap-maroc"}'::jsonb,
  2000,
  '50-200',
  '{"email": "contact@lap.ma", "phone": "+212 5 22 00 00 00", "address": "Casablanca, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- =======================================================
-- 6. URBACOM â€” Communication & Ã‰vÃ©nementiel
--    RÃ´le : Organisateur DÃ©lÃ©guÃ©
-- =======================================================
INSERT INTO public.partners (
  id,
  user_id,
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  country,
  verified,
  featured,
  partnership_level,
  mission,
  vision,
  values,
  expertise,
  key_figures,
  social_media,
  established_year,
  employees,
  contact_info,
  is_published,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  NULL,
  'URBACOM â€” Communication & Ã‰vÃ©nementiel',
  'agency',
  'Communication & Ã‰vÃ©nementiel',
  'URBACOM est une agence spÃ©cialisÃ©e dans l''organisation d''Ã©vÃ©nements professionnels et la communication corporate. Forte d''une expertise reconnue dans les secteurs de l''immobilier, de la construction et de l''urbanisme, URBACOM est l''organisateur dÃ©lÃ©guÃ© du Salon International du BÃ¢timent 2026. Elle assure la conception, la coordination opÃ©rationnelle et la promotion du SIB, garantissant Ã  ses participants une expÃ©rience professionnelle de premier plan.',
  '/logos/urbacom.png',
  'https://urbacom.ma',
  'Maroc',
  true,
  true,
  'organisateur-delegue',
  'Concevoir et exÃ©cuter des Ã©vÃ©nements professionnels Ã  haute valeur ajoutÃ©e qui crÃ©ent des opportunitÃ©s d''affaires rÃ©elles pour les acteurs des secteurs de la construction, de l''immobilier et de l''urbanisme.',
  'ÃŠtre l''agence Ã©vÃ©nementielle de rÃ©fÃ©rence au Maroc pour les salons professionnels du BTP et de l''habitat, reconnue pour son excellence opÃ©rationnelle et sa capacitÃ© Ã  crÃ©er des rendez-vous incontournables.',
  '["Excellence", "CrÃ©ativitÃ©", "Professionnalisme", "RÃ©seau", "Ã‰coute client", "Engagement"]'::jsonb,
  '["Organisation de salons professionnels", "Ã‰vÃ©nementiel corporate", "Communication B2B", "Marketing sectoriel BTP/Immobilier", "Relations presse et mÃ©dias", "Design d''espaces Ã©vÃ©nementiels", "Gestion de stands et pavillons"]'::jsonb,
  '[
    {"label": "Ã‰vÃ©nements organisÃ©s", "value": "50+", "icon": "Calendar"},
    {"label": "Exposants mobilisÃ©s", "value": "2 000+", "icon": "Building"},
    {"label": "Visiteurs professionnels", "value": "100 000+", "icon": "Users"},
    {"label": "Salons organisÃ©s", "value": "10+", "icon": "Award"}
  ]'::jsonb,
  '{"linkedin": "https://www.linkedin.com/company/urbacom", "facebook": "https://www.facebook.com/urbacom.ma", "instagram": "https://www.instagram.com/urbacom_maroc"}'::jsonb,
  2005,
  '10-50',
  '{"email": "contact@urbacom.ma", "phone": "+212 6 61 00 00 00", "address": "Casablanca, Maroc"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values = EXCLUDED.values,
  expertise = EXCLUDED.expertise,
  key_figures = EXCLUDED.key_figures,
  social_media = EXCLUDED.social_media,
  partnership_level = EXCLUDED.partnership_level,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

COMMIT;

-- ========== supabase\migrations\20260412000002_rename_siport_to_sib.sql ==========

-- Migration: Renommer SIPORT â†’ SIB dans les donnÃ©es de la base
-- Date: 2026-04-12
-- Description: Remplacement du branding "SIPORT" (ancien projet portuaire) par "SIB" (Salon International du BÃ¢timent)
-- Note: Utilise des blocs DO $$ pour ne cibler que les tables existantes

DO $$
BEGIN

  -- events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    UPDATE public.events
    SET title       = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'events updated';
  END IF;

  -- news_articles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='news_articles') THEN
    UPDATE public.news_articles
    SET title   = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR content ILIKE '%siport%';
    RAISE NOTICE 'news_articles updated';
  END IF;

  -- articles (si la table existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='articles') THEN
    UPDATE public.articles
    SET title   = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR content ILIKE '%siport%';
    RAISE NOTICE 'articles updated';
  END IF;

  -- media_contents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='media_contents') THEN
    UPDATE public.media_contents
    SET title       = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'media_contents updated';
  END IF;

  -- page_contents (CMS) â€” content is jsonb, cast to text for replace
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='page_contents') THEN
    UPDATE public.page_contents
    SET content = REPLACE(REPLACE(content::text, 'SIPORT', 'SIB'), 'Siport', 'SIB')::jsonb
    WHERE content::text ILIKE '%siport%';
    RAISE NOTICE 'page_contents updated';
  END IF;

  -- salons
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='salons') THEN
    UPDATE public.salons
    SET name        = REPLACE(REPLACE(name, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE name ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'salons updated';
  END IF;

  -- products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') THEN
    UPDATE public.products
    SET name        = REPLACE(REPLACE(name, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE name ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'products updated';
  END IF;

  -- email_templates (si existe) â€” check columns dynamically
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_templates') THEN
    -- update subject if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='subject') THEN
      UPDATE public.email_templates
      SET subject = REPLACE(REPLACE(subject, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE subject ILIKE '%siport%';
    END IF;
    -- update body/html_body/body_html/content depending on which exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='body') THEN
      UPDATE public.email_templates
      SET body = REPLACE(REPLACE(body, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE body ILIKE '%siport%';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='html_body') THEN
      UPDATE public.email_templates
      SET html_body = REPLACE(REPLACE(html_body, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE html_body ILIKE '%siport%';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='content') THEN
      UPDATE public.email_templates
      SET content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE content ILIKE '%siport%';
    END IF;
    RAISE NOTICE 'email_templates updated';
  END IF;

  RAISE NOTICE 'Migration SIPORT â†’ SIB terminÃ©e avec succÃ¨s';
END $$;

-- ========== supabase\migrations\20260601000002_create_site_banners.sql ==========

-- BanniÃ¨res du site (accueil, UrbaEvent, etc.)
CREATE TABLE IF NOT EXISTS public.site_banners (
  key text PRIMARY KEY,
  label text NOT NULL,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_banners IS 'BanniÃ¨res configurables du site public';

INSERT INTO public.site_banners (key, label)
VALUES
  ('urbaevent', 'BanniÃ¨re UrbaEvent (page d''accueil)'),
  ('ministry_egide', 'Logo â€” Sous l''Ã©gide du (bandeau accueil)')
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

-- ========== supabase\migrations\20260601000003_add_ministry_egide_banner.sql ==========

-- Logo Â« Sous l'Ã©gide du Â» â€” configurable depuis le tableau de bord admin
INSERT INTO public.site_banners (key, label)
VALUES ('ministry_egide', 'Logo â€” Sous l''Ã©gide du (bandeau accueil)')
ON CONFLICT (key) DO NOTHING;

-- ========== supabase\migrations\20260601000004_site_banner_storage.sql ==========

-- Stockage des banniÃ¨res site (UrbaEvent, logo ministÃ¨re, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read site banner files" ON storage.objects;
CREATE POLICY "Public read site banner files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
  );

DROP POLICY IF EXISTS "Admins upload site banner files" ON storage.objects;
CREATE POLICY "Admins upload site banner files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins update site banner files" ON storage.objects;
CREATE POLICY "Admins update site banner files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins delete site banner files" ON storage.objects;
CREATE POLICY "Admins delete site banner files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

-- ========== ENREGISTRER HISTORIQUE (optionnel) ==========
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('20260411000002'),('20260412000002'),('20260601000002'),('20260601000003'),('20260601000004'),('20260602000001')
ON CONFLICT (version) DO NOTHING;
