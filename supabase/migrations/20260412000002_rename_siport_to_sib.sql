-- Migration: Renommer SIPORT → SIB dans les données de la base
-- Date: 2026-04-12
-- Description: Remplacement du branding "SIPORT" (ancien projet) par "SIB" (Salon International du Bâtiment)

-- Mettre à jour les titres et descriptions des capsules vidéo
UPDATE capsules
SET 
  title = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';

-- Mettre à jour les titres et descriptions des webinaires/talks
UPDATE webinars
SET 
  title = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';

-- Mettre à jour les médias génériques
UPDATE media_items
SET
  title = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';

-- Mettre à jour les articles/actualités
UPDATE articles
SET
  title = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  excerpt = REPLACE(REPLACE(excerpt, 'SIPORT', 'SIB'), 'Siport', 'SIB')
WHERE title ILIKE '%siport%' OR content ILIKE '%siport%' OR excerpt ILIKE '%siport%';

-- Mettre à jour les événements
UPDATE events
SET
  title = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
  description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';

-- Mettre à jour les tags dans les capsules (jsonb array)
UPDATE capsules
SET tags = (
  SELECT jsonb_agg(
    CASE 
      WHEN tag::text ILIKE '%siport%' 
      THEN to_jsonb(REPLACE(REPLACE(tag::text, '"siport"', '"sib"'), '"SIPORT"', '"SIB"'))
      ELSE tag
    END
  )
  FROM jsonb_array_elements(tags) AS tag
)
WHERE tags::text ILIKE '%siport%';

-- Vérification
SELECT 'capsules' as table_name, COUNT(*) as updated FROM capsules WHERE title ILIKE '%sib%'
UNION ALL
SELECT 'webinars', COUNT(*) FROM webinars WHERE title ILIKE '%sib%'
UNION ALL
SELECT 'media_items', COUNT(*) FROM media_items WHERE title ILIKE '%sib%';
