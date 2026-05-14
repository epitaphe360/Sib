-- Ajout de logos par défaut pour les exposants de test
-- À exécuter dans le SQL Editor de Supabase

-- Fonction helper pour générer un logo SVG coloré
CREATE OR REPLACE FUNCTION generate_logo_svg(company_name TEXT, color_hex TEXT)
RETURNS TEXT AS $$
DECLARE
  initials TEXT;
BEGIN
  -- Extraire les initiales (max 2 lettres)
  initials := UPPER(SUBSTRING(SPLIT_PART(company_name, ' ', 1), 1, 1) || SUBSTRING(SPLIT_PART(company_name, ' ', 2), 1, 1));
  IF LENGTH(initials) = 0 THEN
    initials := 'EX';
  END IF;
  
  -- Retourner le data URI SVG
  RETURN 'data:image/svg+xml;base64,' || encode(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' ||
    '<rect width="200" height="200" rx="20" fill="' || color_hex || '"/>' ||
    '<text x="100" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="700" font-size="70">' || initials || '</text>' ||
    '</svg>', 'escape'::text)::bytea, 'base64');
END;
$$ LANGUAGE plpgsql;

-- Mise à jour des logos pour la table exhibitors
UPDATE exhibitors e
SET logo_url = CASE e.company_name
  WHEN 'ABB Marine & Ports' THEN generate_logo_svg('ABB Marine & Ports', '#1e40af')
  WHEN 'Advanced Port Systems' THEN generate_logo_svg('Advanced Port Systems', '#7c3aed')
  WHEN 'Maritime Equipment Co' THEN generate_logo_svg('Maritime Equipment Co', '#dc2626')
  WHEN 'StartUp Port Innovations' THEN generate_logo_svg('StartUp Port Innovations', '#059669')
  ELSE generate_logo_svg(COALESCE(e.company_name, 'Exposant'), '#0891b2')
END
WHERE logo_url IS NULL OR logo_url = '';

-- Mise à jour des logos pour la table exhibitor_profiles
UPDATE exhibitor_profiles ep
SET logo_url = CASE ep.company_name
  WHEN 'ABB Marine & Ports' THEN generate_logo_svg('ABB Marine & Ports', '#1e40af')
  WHEN 'Advanced Port Systems' THEN generate_logo_svg('Advanced Port Systems', '#7c3aed')
  WHEN 'Maritime Equipment Co' THEN generate_logo_svg('Maritime Equipment Co', '#dc2626')
  WHEN 'StartUp Port Innovations' THEN generate_logo_svg('StartUp Port Innovations', '#059669')
  ELSE generate_logo_svg(COALESCE(ep.company_name, 'Exposant'), '#0891b2')
END
WHERE logo_url IS NULL OR logo_url = '';

-- Mise à jour des logos dans le profil JSON des users type exhibitor
UPDATE users u
SET profile = jsonb_set(
  COALESCE(u.profile, '{}'::jsonb),
  '{logo_url}',
  to_jsonb(
    CASE u.name
      WHEN 'ABB Marine & Ports' THEN generate_logo_svg('ABB Marine & Ports', '#1e40af')
      WHEN 'Advanced Port Systems' THEN generate_logo_svg('Advanced Port Systems', '#7c3aed')
      WHEN 'Maritime Equipment Co' THEN generate_logo_svg('Maritime Equipment Co', '#dc2626')
      WHEN 'StartUp Port Innovations' THEN generate_logo_svg('StartUp Port Innovations', '#059669')
      ELSE generate_logo_svg(COALESCE(u.name, 'Exposant'), '#0891b2')
    END
  )
)
WHERE u.type = 'exhibitor' 
  AND (
    u.profile IS NULL 
    OR u.profile->>'logo_url' IS NULL 
    OR u.profile->>'logo_url' = ''
  );

-- Vérification
SELECT 
  'exhibitors' as table_name,
  company_name,
  CASE 
    WHEN logo_url IS NOT NULL AND logo_url != '' THEN '✅ Logo ajouté'
    ELSE '❌ Pas de logo'
  END as status,
  LEFT(logo_url, 50) || '...' as logo_preview
FROM exhibitors
WHERE company_name IN ('ABB Marine & Ports', 'Advanced Port Systems', 'Maritime Equipment Co', 'StartUp Port Innovations')

UNION ALL

SELECT 
  'users' as table_name,
  name as company_name,
  CASE 
    WHEN profile->>'logo_url' IS NOT NULL AND profile->>'logo_url' != '' THEN '✅ Logo ajouté'
    ELSE '❌ Pas de logo'
  END as status,
  LEFT(profile->>'logo_url', 50) || '...' as logo_preview
FROM users
WHERE type = 'exhibitor' AND name IN ('ABB Marine & Ports', 'Advanced Port Systems', 'Maritime Equipment Co', 'StartUp Port Innovations');

-- Nettoyage
DROP FUNCTION IF EXISTS generate_logo_svg(TEXT, TEXT);
