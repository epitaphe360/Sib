-- Script pour remplacer toutes les références à l'Algérie par le Maroc
-- ET supprimer tout contenu lié au sport (ce salon concerne les PORTS maritimes, pas le sport)
-- À exécuter dans Supabase SQL Editor

-- =====================================================
-- PARTIE 1: SUPPRIMER TOUT CE QUI CONCERNE LE SPORT
-- =====================================================

-- Supprimer les media_contents liés au sport
DELETE FROM media_contents 
WHERE title ILIKE '%sport%' 
   OR description ILIKE '%sport%'
   OR title ILIKE '%sportif%'
   OR title ILIKE '%sportive%';

-- Supprimer les events liés au sport
DELETE FROM events 
WHERE title ILIKE '%sport%' 
   OR description ILIKE '%sport%'
   OR title ILIKE '%sportif%'
   OR title ILIKE '%sportive%';

-- Supprimer les news_articles liés au sport
DELETE FROM news_articles 
WHERE title ILIKE '%sport%' 
   OR content ILIKE '%sport%'
   OR title ILIKE '%sportif%'
   OR title ILIKE '%sportive%';

-- =====================================================
-- PARTIE 2: REMPLACER ALGÉRIE PAR MAROC
-- =====================================================

-- 1. Mettre à jour media_contents
UPDATE media_contents SET 
  title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(title, 
    'Algérie', 'Maroc'), 
    'algérie', 'Maroc'), 
    'algérienne', 'marocaine'), 
    'algérien', 'marocain'), 
    'algériens', 'marocains'), 
    'algériennes', 'marocaines'),
  description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 
    'Algérie', 'Maroc'), 
    'algérie', 'Maroc'), 
    'algérienne', 'marocaine'), 
    'algérien', 'marocain'), 
    'algériens', 'marocains'), 
    'algériennes', 'marocaines')
WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%';

-- 2. Mettre à jour les speakers dans media_contents (JSONB)
UPDATE media_contents SET 
  speakers = REPLACE(speakers::text, 'Algérie Ports', 'Marsa Maroc')::jsonb
WHERE speakers::text ILIKE '%Algérie%';

UPDATE media_contents SET 
  speakers = REPLACE(speakers::text, 'PortTech DZ', 'PortTech Maroc')::jsonb
WHERE speakers::text ILIKE '%DZ%';

-- 3. Mettre à jour salon_config
UPDATE salon_config SET 
  location = REPLACE(REPLACE(location, 'Alger', 'Casablanca'), 'Algérie', 'Maroc'),
  description = REPLACE(description, 'Algérie', 'Maroc')
WHERE location ILIKE '%algéri%' OR description ILIKE '%algéri%' OR location ILIKE '%Alger%';

-- 4. Mettre à jour events
UPDATE events SET 
  title = REPLACE(REPLACE(REPLACE(title, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain'),
  description = REPLACE(REPLACE(REPLACE(description, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%';

-- 5. Mettre à jour news_articles
UPDATE news_articles SET 
  title = REPLACE(REPLACE(REPLACE(title, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain'),
  content = REPLACE(REPLACE(REPLACE(content, 'Algérie', 'Maroc'), 'algérienne', 'marocaine'), 'algérien', 'marocain')
WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%';

-- 6. Vérification des modifications
SELECT 'media_contents avec Algérie:' as check_table, COUNT(*) as count FROM media_contents WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'events avec Algérie:', COUNT(*) FROM events WHERE title ILIKE '%algéri%' OR description ILIKE '%algéri%'
UNION ALL
SELECT 'news_articles avec Algérie:', COUNT(*) FROM news_articles WHERE title ILIKE '%algéri%' OR content ILIKE '%algéri%'
UNION ALL
SELECT 'media_contents avec sport:', COUNT(*) FROM media_contents WHERE title ILIKE '%sport%' OR description ILIKE '%sport%'
UNION ALL
SELECT 'events avec sport:', COUNT(*) FROM events WHERE title ILIKE '%sport%' OR description ILIKE '%sport%'
UNION ALL
SELECT 'news_articles avec sport:', COUNT(*) FROM news_articles WHERE title ILIKE '%sport%' OR content ILIKE '%sport%';
