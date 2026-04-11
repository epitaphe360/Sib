-- Migration pour standardiser les colonnes de news_articles
-- Date: 2026-02-23

-- Renommer image_url en featured_image
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'featured_image'
  ) THEN
    ALTER TABLE news_articles RENAME COLUMN image_url TO featured_image;
    RAISE NOTICE 'Colonne image_url renommée en featured_image';
  END IF;
END $$;

-- Renommer published en is_published pour cohérence
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'published'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE news_articles RENAME COLUMN published TO is_published;
    RAISE NOTICE 'Colonne published renommée en is_published';
  END IF;
END $$;

-- Ajouter slug si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN slug text;
    RAISE NOTICE 'Colonne slug ajoutée';
  END IF;
END $$;

-- Ajouter title_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN title_en text;
    RAISE NOTICE 'Colonne title_en ajoutée';
  END IF;
END $$;

-- Ajouter excerpt_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'excerpt_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN excerpt_en text;
    RAISE NOTICE 'Colonne excerpt_en ajoutée';
  END IF;
END $$;

-- Ajouter content_en si n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'content_en'
  ) THEN
    ALTER TABLE news_articles ADD COLUMN content_en text;
    RAISE NOTICE 'Colonne content_en ajoutée';
  END IF;
END $$;

-- Créer un index sur slug pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);

-- Créer un index sur is_published et published_at
DROP INDEX IF EXISTS idx_news_published;
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news_articles(is_published, published_at);

-- Commentaires
COMMENT ON COLUMN news_articles.featured_image IS 'URL de l''image principale de l''article';
COMMENT ON COLUMN news_articles.is_published IS 'Indicateur si l''article est publié';
COMMENT ON COLUMN news_articles.slug IS 'Slug URL-friendly pour l''article';
COMMENT ON COLUMN news_articles.title_en IS 'Titre en anglais';
COMMENT ON COLUMN news_articles.excerpt_en IS 'Extrait en anglais';
COMMENT ON COLUMN news_articles.content_en IS 'Contenu complet en anglais';
