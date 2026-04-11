-- Migration pour améliorer la table partners avec les nouveaux champs
-- Date: 2025-12-29
-- Description: Ajout de champs pour la page partenaire enrichie (En savoir plus)

-- Ajouter les nouvelles colonnes pour les informations enrichies
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS clients jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS established_year integer,
ADD COLUMN IF NOT EXISTS employees text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN partners.mission IS 'Mission de l''entreprise';
COMMENT ON COLUMN partners.vision IS 'Vision de l''entreprise';
COMMENT ON COLUMN partners.values IS 'Valeurs de l''entreprise (JSONB array de strings)';
COMMENT ON COLUMN partners.certifications IS 'Certifications obtenues (JSONB array de strings)';
COMMENT ON COLUMN partners.awards IS 'Récompenses (JSONB array de {name, year, issuer})';
COMMENT ON COLUMN partners.social_media IS 'Liens réseaux sociaux (JSONB object {linkedin, twitter, facebook, instagram, youtube})';
COMMENT ON COLUMN partners.key_figures IS 'Chiffres clés (JSONB array de {label, value, icon})';
COMMENT ON COLUMN partners.testimonials IS 'Témoignages (JSONB array de {quote, author, role, avatar})';
COMMENT ON COLUMN partners.news IS 'Actualités du partenaire (JSONB array de {title, date, excerpt, image})';
COMMENT ON COLUMN partners.expertise IS 'Domaines d''expertise (JSONB array de strings)';
COMMENT ON COLUMN partners.clients IS 'Clients référents (JSONB array de strings)';
COMMENT ON COLUMN partners.video_url IS 'URL de la vidéo de présentation (YouTube, Vimeo)';
COMMENT ON COLUMN partners.gallery IS 'Galerie photos (JSONB array d''URLs)';
COMMENT ON COLUMN partners.established_year IS 'Année de création de l''entreprise';
COMMENT ON COLUMN partners.employees IS 'Nombre d''employés (ex: 500-1000)';
COMMENT ON COLUMN partners.country IS 'Pays de l''entreprise';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_partners_country ON partners(country);
CREATE INDEX IF NOT EXISTS idx_partners_established_year ON partners(established_year);

-- Mise à jour des données existantes avec des valeurs par défaut enrichies pour la démo
UPDATE partners
SET 
  mission = COALESCE(mission, 'Contribuer à l''excellence du secteur portuaire africain par l''innovation et le partenariat durable.'),
  vision = COALESCE(vision, 'Devenir un acteur clé de la transformation digitale des infrastructures portuaires.'),
  values = COALESCE(NULLIF(values::text, '[]')::jsonb, '["Innovation", "Excellence", "Durabilité", "Partenariat", "Intégrité"]'::jsonb),
  expertise = COALESCE(NULLIF(expertise::text, '[]')::jsonb, '["Gestion portuaire", "Digitalisation", "Logistique maritime", "Développement durable"]'::jsonb),
  established_year = COALESCE(established_year, 2010),
  employees = COALESCE(employees, '500-1000'),
  country = COALESCE(country, 'Maroc'),
  certifications = COALESCE(NULLIF(certifications::text, '[]')::jsonb, '["ISO 9001:2015", "ISO 14001:2015"]'::jsonb)
WHERE mission IS NULL OR values = '[]'::jsonb;

-- Exemple de structure pour les awards
-- [
--   {"name": "Prix de l'Innovation", "year": 2024, "issuer": "African Ports Association"}
-- ]

-- Exemple de structure pour social_media
-- {
--   "linkedin": "https://linkedin.com/company/...",
--   "twitter": "https://twitter.com/...",
--   "facebook": "https://facebook.com/...",
--   "youtube": "https://youtube.com/@..."
-- }

-- Exemple de structure pour testimonials
-- [
--   {
--     "quote": "Un partenaire d'exception...",
--     "author": "Jean Dupont",
--     "role": "Directeur Général",
--     "avatar": "https://..."
--   }
-- ]

-- Exemple de structure pour key_figures
-- [
--   {"label": "Chiffre d'affaires", "value": "45M €", "icon": "TrendingUp"},
--   {"label": "Projets réalisés", "value": "120+", "icon": "Target"}
-- ]

-- Vérification de la structure finale
SELECT 
  id,
  company_name,
  mission,
  vision,
  values,
  certifications,
  established_year,
  employees,
  country,
  expertise
FROM partners
LIMIT 3;
