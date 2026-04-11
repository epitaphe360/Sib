-- ============================================================
-- SCRIPT SQL: Enrichissement des profils partenaires officiels SIB 2026
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr/sql
-- ============================================================

-- Étape 1: Ajouter les colonnes de profil enrichi
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS mission text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS vision text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS clients jsonb DEFAULT '[]';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]';

-- Notifier PostgREST de recharger le schéma
NOTIFY pgrst, 'reload schema';

-- Étape 2: Mettre à jour les profils des partenaires officiels

-- Ministère
UPDATE public.partners SET
  mission = 'Élaborer et mettre en œuvre une politique nationale intégrée en matière d''aménagement du territoire, d''urbanisme, de logement et de politique de la ville, au service d''un développement durable, équilibré et inclusif.',
  vision = 'Un Maroc dont les villes et les territoires sont des espaces de vie harmonieux, durables et attractifs, offrant à tous les citoyens un cadre de vie de qualité et un accès équitable au logement.',
  values = '["Équité territoriale","Durabilité","Innovation urbaine","Qualité architecturale","Cohésion sociale"]'::jsonb,
  expertise = '["Politique du logement","Planification urbaine","Réhabilitation des quartiers","Villes durables","Habitat social","Réglementation de la construction"]'::jsonb,
  key_figures = '[{"label":"Logements produits/an","value":"100 000+","icon":"Home"},{"label":"Budget (MMDH)","value":"8+","icon":"TrendingUp"},{"label":"Programmes actifs","value":"15+","icon":"Building"}]'::jsonb,
  social_media = '{"facebook":"https://www.facebook.com/muat.gov.ma"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000001';

-- AMDIE
UPDATE public.partners SET
  mission = 'Promouvoir le Maroc comme destination d''investissement de premier rang et accompagner les entreprises marocaines à l''international, en s''appuyant sur la stratégie Morocco Now.',
  vision = 'Faire du Maroc un pôle d''attractivité mondial pour l''investissement et un champion des exportations africaines.',
  values = '["Innovation","Efficacité","Transparence","Partenariat public-privé","Compétitivité","Durabilité"]'::jsonb,
  expertise = '["Promotion des investissements étrangers","Développement des exportations","Organisation de foires","Accompagnement des investisseurs","Intelligence économique"]'::jsonb,
  key_figures = '[{"label":"Projets approuvés 2025 (MMDH)","value":"110+","icon":"TrendingUp"},{"label":"Actions de promotion","value":"55+","icon":"Globe"},{"label":"Pays couverts","value":"80+","icon":"MapPin"},{"label":"Emplois générés","value":"50 000+","icon":"Users"}]'::jsonb,
  social_media = '{"linkedin":"https://www.linkedin.com/company/amdie","twitter":"https://twitter.com/AMDIE_MA","facebook":"https://www.facebook.com/amdie.gov.ma"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000002';

-- FMC
UPDATE public.partners SET
  mission = 'Fédérer, représenter et défendre les industries marocaines des matériaux de construction, tout en promouvant innovation, qualité et durabilité.',
  vision = 'Positionner l''industrie marocaine des matériaux de construction comme acteur de référence à l''échelle africaine.',
  values = '["Qualité","Innovation","Durabilité","Solidarité professionnelle","Performance industrielle"]'::jsonb,
  expertise = '["Ciment et béton","Céramique et carrelage","Acier de construction","Verre architectural","Isolation thermique","Normalisation et certification"]'::jsonb,
  key_figures = '[{"label":"Entreprises membres","value":"150+","icon":"Building"},{"label":"CA annuel (MMDH)","value":"40+","icon":"TrendingUp"},{"label":"Emplois directs","value":"60 000+","icon":"Users"}]'::jsonb,
  social_media = '{"linkedin":"https://www.linkedin.com/company/fmc-maroc"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000003';

-- FNBTP
UPDATE public.partners SET
  mission = 'Représenter, défendre et promouvoir les entreprises du BTP marocain, favoriser un environnement propice à leur développement et contribuer à l''élévation des standards de qualité.',
  vision = 'Un secteur du BTP marocain compétitif, innovant et durable, reconnu à l''échelle africaine et internationale.',
  values = '["Éthique professionnelle","Équité","Qualité","Performance","Formation continue","Innovation"]'::jsonb,
  expertise = '["Bâtiment résidentiel et commercial","Travaux publics","Génie civil","Qualification des entreprises","Formation professionnelle BTP","Marchés publics"]'::jsonb,
  key_figures = '[{"label":"% du PIB national","value":"6,2 %","icon":"TrendingUp"},{"label":"Emplois générés","value":"1,2 M","icon":"Users"},{"label":"% de la FBCF","value":"55 %","icon":"BarChart"},{"label":"Croissance sectorielle","value":"6,7 %","icon":"ArrowUp"}]'::jsonb,
  social_media = '{"linkedin":"https://www.linkedin.com/company/fnbtp","twitter":"https://x.com/fnbtp","facebook":"https://facebook.com/FNBTP","youtube":"https://youtube.com/@FNBTP_Maroc"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000004';

-- LAP
UPDATE public.partners SET
  mission = 'Fournir aux professionnels du bâtiment des solutions techniques innovantes, fiables et performantes, en mettant l''accent sur la qualité et le service client.',
  vision = 'Être la référence marocaine des solutions techniques pour la construction.',
  values = '["Fiabilité","Innovation technique","Qualité","Service client","Durabilité"]'::jsonb,
  expertise = '["Équipements électriques","Solutions d''alimentation","Matériel de connexion","Solutions pour le bâtiment"]'::jsonb,
  key_figures = '[{"label":"Années d''expérience","value":"20+","icon":"Calendar"},{"label":"Références clients","value":"500+","icon":"Users"},{"label":"Produits catalogue","value":"10 000+","icon":"Package"}]'::jsonb,
  social_media = '{"linkedin":"https://www.linkedin.com/company/lap-maroc"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000005';

-- URBACOM
UPDATE public.partners SET
  mission = 'Concevoir et exécuter des événements professionnels à haute valeur ajoutée qui créent des opportunités d''affaires réelles pour les acteurs de la construction et de l''immobilier.',
  vision = 'Être l''agence événementielle de référence au Maroc pour les salons professionnels du BTP et de l''habitat.',
  values = '["Excellence","Créativité","Professionnalisme","Réseau","Engagement"]'::jsonb,
  expertise = '["Organisation de salons professionnels","Événementiel corporate","Communication B2B","Marketing BTP/Immobilier","Relations presse","Design d''espaces événementiels"]'::jsonb,
  key_figures = '[{"label":"Événements organisés","value":"50+","icon":"Calendar"},{"label":"Exposants mobilisés","value":"2 000+","icon":"Building"},{"label":"Visiteurs professionnels","value":"100 000+","icon":"Users"}]'::jsonb,
  social_media = '{"linkedin":"https://www.linkedin.com/company/urbacom","facebook":"https://www.facebook.com/urbacom.ma","instagram":"https://www.instagram.com/urbacom_maroc"}'::jsonb
WHERE id = '10000000-0000-0000-0000-000000000006';

-- Vérification
SELECT id, company_name, partnership_level, 
       CASE WHEN mission IS NOT NULL THEN '✅' ELSE '❌' END as has_mission,
       CASE WHEN expertise IS NOT NULL THEN '✅' ELSE '❌' END as has_expertise
FROM public.partners
WHERE id LIKE '10000000%'
ORDER BY id;
