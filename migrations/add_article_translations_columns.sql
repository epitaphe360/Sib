-- Migration: Ajouter les colonnes de traduction EN à la table news_articles
-- À exécuter dans: Supabase SQL Editor

-- Ajouter les colonnes pour les traductions EN
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS excerpt_en TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_en TEXT;

-- Ajouter un index pour les recherches par langue
CREATE INDEX IF NOT EXISTS idx_news_articles_title_en ON news_articles(title_en);

-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news_articles' 
ORDER BY ordinal_position;
