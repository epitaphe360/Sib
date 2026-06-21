-- Synchroniser is_published avec published (8 articles en prod ont published=true, is_published=false)

UPDATE public.news_articles
SET is_published = COALESCE(published, is_published, false)
WHERE is_published IS DISTINCT FROM COALESCE(published, is_published, false);
