-- Migration: Insertion des partenaires officiels du SIB 2026
-- Date: 2026-04-11
-- Description: Ajout des 6 partenaires institutionnels officiels avec profils complets

BEGIN;

-- S'assurer que les colonnes enhanced existent (dépendances de 20251229_enhance_partners_table)
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
-- 1. Ministère de l'Aménagement du Territoire National,
--    de l'Urbanisme, de l'Habitat et de la Politique de la Ville
--    Rôle : Co-organisateur
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
  'Ministère de l''Aménagement du Territoire National, de l''Urbanisme, de l''Habitat et de la Politique de la Ville',
  'government',
  'Urbanisme & Habitat',
  'Le Ministère chargé de l''Urbanisme et de l''Habitat est responsable de la conception et de la mise en œuvre des politiques nationales en matière d''aménagement du territoire, d''urbanisme, de logement et de développement urbain durableour. À la tête du salon SIB 2026, il incarne l''engagement de l''État marocain pour un habitat inclusif, durable et de qualité.',
  '/logo-ministere.png',
  'https://www.mhpv.gov.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Élaborer et mettre en œuvre une politique nationale intégrée en matière d''aménagement du territoire, d''urbanisme, de logement et de politique de la ville, au service d''un développement durable, équilibré et inclusif.',
  'Un Maroc dont les villes et les territoires sont des espaces de vie harmonieux, durables et attractifs, offrant à tous les citoyens un cadre de vie de qualité et un accès équitable au logement.',
  '["Équité territoriale", "Durabilité", "Innovation urbaine", "Participation citoyenne", "Qualité architecturale", "Cohésion sociale"]'::jsonb,
  '["Politique du logement", "Planification urbaine", "Réhabilitation des quartiers", "Villes durables", "Habitat social", "Réglementation de la construction", "Politique de la ville"]'::jsonb,
  '[
    {"label": "Unités de logement produites annuellement", "value": "100 000+", "icon": "Home"},
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
-- 2. AMDIE — Agence Marocaine de Développement
--    des Investissements et des Exportations
--    Rôle : Co-organisateur
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
  'AMDIE — Agence Marocaine de Développement des Investissements et des Exportations',
  'institutional',
  'Investissement & Commerce International',
  'L''AMDIE est l''organisme national chargé de promouvoir les investissements nationaux et étrangers ainsi que le développement des exportations marocaines. Créée en 2017 par la fusion de l''AMDI, Maroc Export et l''OFEC, elle constitue un guichet unique pour les investisseurs et pilote la marque stratégique «Morocco Now». Partenaire incontournable du SIB 2026 pour attirer les investissements dans le secteur de la construction et du BTP.',
  '/logos/amdie.png',
  'https://www.amdie.gov.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Promouvoir le Maroc comme destination d''investissement de premier rang et accompagner les entreprises marocaines à l''international, en s''appuyant sur la stratégie «Morocco Now» pour positionner le Royaume comme un hub industriel et logistique compétitif.',
  'Faire du Maroc un pôle d''attractivité mondial pour l''investissement et un champion des exportations africaines, contribuant à une croissance économique durable et à la création d''emplois qualifiés.',
  '["Innovation", "Efficacité", "Transparence", "Partenariat public-privé", "Compétitivité", "Durabilité"]'::jsonb,
  '["Promotion des investissements étrangers", "Développement des exportations", "Organisation de foires et expositions", "Accompagnement des investisseurs", "Intelligence économique", "Partenariats stratégiques internationaux"]'::jsonb,
  '[
    {"label": "Projets d''investissement approuvés en 2025 (MMDH)", "value": "110+", "icon": "TrendingUp"},
    {"label": "Actions de promotion menées en 2025", "value": "55+", "icon": "Globe"},
    {"label": "Pays couverts", "value": "80+", "icon": "MapPin"},
    {"label": "Emplois générés", "value": "50 000+", "icon": "Users"}
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
-- 3. FMC — Fédération des Industries des Matériaux
--    de Construction
--    Rôle : Co-organisateur
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
  'FMC — Fédération des Industries des Matériaux de Construction',
  'institutional',
  'Matériaux de Construction',
  'La FMC représente l''ensemble des industries productrices de matériaux de construction au Maroc : ciment, béton, céramique, plâtre, briques, verre, acier et autres matériaux de second œuvre. Elle joue un rôle clé dans la structuration de la filière, la promotion de l''innovation et le dialogue avec les pouvoirs publics. Partenaire co-organisateur du SIB 2026, elle mobilise tout l''écosystème industriel au service de l''habitat.',
  '/logos/fmc.png',
  'https://fmc.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Fédérer, représenter et défendre les intérêts des industries marocaines des matériaux de construction, tout en promouvant l''innovation, la qualité et la durabilité au sein de la filière.',
  'Positionner l''industrie marocaine des matériaux de construction comme un acteur de référence à l''échelle africaine, capable de répondre aux enjeux du logement abordable et durable.',
  '["Qualité", "Innovation", "Durabilité", "Solidarité professionnelle", "Performance industrielle"]'::jsonb,
  '["Ciment et béton", "Céramique et carrelage", "Acier de construction", "Verre architectural", "Isolation thermique et acoustique", "Matériaux de second œuvre", "Normalisation et certification"]'::jsonb,
  '[
    {"label": "Entreprises membres", "value": "150+", "icon": "Building"},
    {"label": "Chiffre d''affaires annuel (MMDH)", "value": "40+", "icon": "TrendingUp"},
    {"label": "Emplois directs", "value": "60 000+", "icon": "Users"},
    {"label": "Capacité ciment (Mt/an)", "value": "20+", "icon": "Package"}
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
-- 4. FNBTP — Fédération Nationale du Bâtiment
--    et des Travaux Publics
--    Rôle : Co-organisateur
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
  'FNBTP — Fédération Nationale du Bâtiment et des Travaux Publics',
  'institutional',
  'BTP',
  'La FNBTP est l''organisation professionnelle centrale des entreprises marocaines du Bâtiment et des Travaux Publics. Forte de plus de quatre décennies d''existence, elle représente des milliers d''entreprises, grandes, moyennes et petites, auprès des autorités publiques et des institutions. Avec une contribution de 6,2 % du PIB national et 1,2 million d''emplois, le secteur BTP est l''un des piliers de l''économie marocaine. Partenaire co-organisateur du SIB 2026.',
  '/logos/fnbtp.png',
  'https://fnbtp.ma',
  'Maroc',
  true,
  true,
  'co-organisateur',
  'Représenter, défendre et promouvoir les entreprises du BTP marocain, favoriser un environnement réglementaire et économique propice à leur développement, et contribuer à l''élévation des standards de qualité, d''éthique et de performance du secteur.',
  'Un secteur du BTP marocain compétitif, innovant et durable, reconnu à l''échelle africaine et internationale pour sa capacité à livrer des projets d''excellence.',
  '["Éthique professionnelle", "Équité", "Qualité", "Performance", "Formation continue", "Innovation"]'::jsonb,
  '["Bâtiment résidentiel et commercial", "Travaux publics et infrastructure", "Génie civil", "Qualification et classification des entreprises", "Formation professionnelle BTP", "Veille réglementaire et marchés publics", "Développement durable dans la construction"]'::jsonb,
  '[
    {"label": "% du PIB national", "value": "6,2 %", "icon": "TrendingUp"},
    {"label": "Emplois générés", "value": "1,2 M", "icon": "Users"},
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
-- 5. LAP — Sponsor Officiel
--    Logo rouge avec icône prise électrique
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
  'Solutions Techniques & Équipements',
  'LAP est un acteur spécialisé dans la fourniture de solutions techniques pour le bâtiment et l''industrie. Expert en équipements électriques, alimentation en énergie et solutions de connexion pour les professionnels du BTP et de l''aménagement, LAP est sponsor officiel du SIB 2026 et contribue à l''excellence technique du salon.',
  '/logos/lap.png',
  'https://lap.ma',
  'Maroc',
  true,
  true,
  'sponsor-officiel',
  'Fournir aux professionnels du bâtiment et de l''industrie des solutions techniques innovantes, fiables et performantes, en mettant l''accent sur la qualité et le service client.',
  'Être la référence marocaine des solutions techniques pour la construction, en proposant une gamme complète de produits à forte valeur ajoutée.',
  '["Fiabilité", "Innovation technique", "Qualité", "Service client", "Durabilité"]'::jsonb,
  '["Équipements électriques", "Solutions d''alimentation", "Matériel de connexion", "Solutions pour le bâtiment", "Distribution d''équipements techniques"]'::jsonb,
  '[
    {"label": "Années d''expérience", "value": "20+", "icon": "Calendar"},
    {"label": "Références clients", "value": "500+", "icon": "Users"},
    {"label": "Produits au catalogue", "value": "10 000+", "icon": "Package"},
    {"label": "Régions couvertes", "value": "12", "icon": "MapPin"}
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
-- 6. URBACOM — Communication & Événementiel
--    Rôle : Organisateur Délégué
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
  'URBACOM — Communication & Événementiel',
  'agency',
  'Communication & Événementiel',
  'URBACOM est une agence spécialisée dans l''organisation d''événements professionnels et la communication corporate. Forte d''une expertise reconnue dans les secteurs de l''immobilier, de la construction et de l''urbanisme, URBACOM est l''organisateur délégué du Salon International du Bâtiment 2026. Elle assure la conception, la coordination opérationnelle et la promotion du SIB, garantissant à ses participants une expérience professionnelle de premier plan.',
  '/logos/urbacom.png',
  'https://urbacom.ma',
  'Maroc',
  true,
  true,
  'organisateur-delegue',
  'Concevoir et exécuter des événements professionnels à haute valeur ajoutée qui créent des opportunités d''affaires réelles pour les acteurs des secteurs de la construction, de l''immobilier et de l''urbanisme.',
  'Être l''agence événementielle de référence au Maroc pour les salons professionnels du BTP et de l''habitat, reconnue pour son excellence opérationnelle et sa capacité à créer des rendez-vous incontournables.',
  '["Excellence", "Créativité", "Professionnalisme", "Réseau", "Écoute client", "Engagement"]'::jsonb,
  '["Organisation de salons professionnels", "Événementiel corporate", "Communication B2B", "Marketing sectoriel BTP/Immobilier", "Relations presse et médias", "Design d''espaces événementiels", "Gestion de stands et pavillons"]'::jsonb,
  '[
    {"label": "Événements organisés", "value": "50+", "icon": "Calendar"},
    {"label": "Exposants mobilisés", "value": "2 000+", "icon": "Building"},
    {"label": "Visiteurs professionnels", "value": "100 000+", "icon": "Users"},
    {"label": "Salons organisés", "value": "10+", "icon": "Award"}
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
