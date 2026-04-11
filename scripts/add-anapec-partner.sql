-- ============================================================================
-- INSERTION DU PARTENAIRE ANAPEC
-- ============================================================================
-- Ce script ajoute ANAPEC comme partenaire dans Supabase
-- Exécuter dans: SQL Editor de Supabase

BEGIN;

-- 1. Supprimer ANAPEC s'il existe déjà
DELETE FROM public.partners 
WHERE company_name = 'Agence Nationale de Promotion de l''Emploi et des Compétences (ANAPEC)';

-- 2. Insérer ANAPEC
INSERT INTO public.partners (
  company_name,
  partner_type,
  sector,
  description,
  logo_url,
  website,
  verified,
  featured,
  contact_info,
  partnership_level,
  benefits
) VALUES (
  'Agence Nationale de Promotion de l''Emploi et des Compétences (ANAPEC)',
  'government',
  'Employment & Skills',
  'L''ANAPEC est un établissement public administratif marocain, sous la tutelle de l''État, agissant comme le bras opérationnel du gouvernement pour la promotion de l''emploi et des compétences.',
  'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c3/Logo_ANAPEC.svg/1200px-Logo_ANAPEC.svg.png',
  'http://www.anapec.org',
  true,
  true,
  jsonb_build_object(
    'email', 'skills@anapec.org',
    'phone', '+212 522 789 450',
    'address', '4, Lotissement La Colline - Sidi Maarouf 20270 - Casablanca - Maroc',
    'social', jsonb_build_object(
      'linkedin', 'https://www.linkedin.com/company/anapec/',
      'facebook', 'https://www.facebook.com/anapec.officiel/',
      'instagram', 'https://www.instagram.com/anapec_officiel/',
      'twitter', 'https://x.com/anapec',
      'youtube', 'https://www.youtube.com/anapectv'
    ),
    'mission', 'Prospection et collecte des offres d''emploi, accueil et orientation des demandeurs, appui à la création d''entreprises, et mise en œuvre des programmes nationaux d''emploi.'
  ),
  'gold',
  jsonb_build_array(
    jsonb_build_object(
      'name', 'Programme IDMAJ',
      'description', 'Encouragement à l''embauche des nouveaux demandeurs d''emploi via des contrats d''insertion avec exonération de charges sociales.',
      'features', jsonb_build_array('Stage de 24 mois max', 'Indemnité 1600-6000 DH', 'Exonération CNSS/TFP/IR')
    ),
    jsonb_build_object(
      'name', 'Programme TAHFIZ',
      'description', 'Soutien aux entreprises et associations créées entre 2015 et 2026 pour le recrutement de leurs premiers salariés.',
      'features', jsonb_build_array('Exonération IR (plafond 10k DH)', 'Prise en charge part patronale CNSS', 'Limite de 5 salariés')
    ),
    jsonb_build_object(
      'name', 'Awrach 2 / Prime d''Appui à l''Emploi',
      'description', 'Prime mensuelle versée aux employeurs pour favoriser les recrutements durables.',
      'features', jsonb_build_array('Prime de 1500 DH/mois', 'Durée de 9 mois', 'Contrat de 12 mois min')
    )
  )
)
ON CONFLICT DO NOTHING;

-- 3. Vérifier l'insertion
SELECT 
  id,
  company_name,
  partner_type,
  sector,
  verified,
  featured,
  created_at
FROM public.partners
WHERE company_name = 'Agence Nationale de Promotion de l''Emploi et des Compétences (ANAPEC)';

COMMIT;
