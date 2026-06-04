-- Migration: Renommer SIPORT → SIB dans les données de la base
-- Date: 2026-04-12
-- Description: Remplacement du branding "SIPORT" (ancien projet portuaire) par "SIB" (Salon International du Bâtiment)
-- Note: Utilise des blocs DO $$ pour ne cibler que les tables existantes

DO $$
BEGIN

  -- events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    UPDATE public.events
    SET title       = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'events updated';
  END IF;

  -- news_articles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='news_articles') THEN
    UPDATE public.news_articles
    SET title   = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR content ILIKE '%siport%';
    RAISE NOTICE 'news_articles updated';
  END IF;

  -- articles (si la table existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='articles') THEN
    UPDATE public.articles
    SET title   = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR content ILIKE '%siport%';
    RAISE NOTICE 'articles updated';
  END IF;

  -- media_contents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='media_contents') THEN
    UPDATE public.media_contents
    SET title       = REPLACE(REPLACE(title, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE title ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'media_contents updated';
  END IF;

  -- page_contents (CMS) — content is jsonb, cast to text for replace
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='page_contents') THEN
    UPDATE public.page_contents
    SET content = REPLACE(REPLACE(content::text, 'SIPORT', 'SIB'), 'Siport', 'SIB')::jsonb
    WHERE content::text ILIKE '%siport%';
    RAISE NOTICE 'page_contents updated';
  END IF;

  -- salons
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='salons') THEN
    UPDATE public.salons
    SET name        = REPLACE(REPLACE(name, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE name ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'salons updated';
  END IF;

  -- products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') THEN
    UPDATE public.products
    SET name        = REPLACE(REPLACE(name, 'SIPORT', 'SIB'), 'Siport', 'SIB'),
        description = REPLACE(REPLACE(description, 'SIPORT', 'SIB'), 'Siport', 'SIB')
    WHERE name ILIKE '%siport%' OR description ILIKE '%siport%';
    RAISE NOTICE 'products updated';
  END IF;

  -- email_templates (si existe) — check columns dynamically
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_templates') THEN
    -- update subject if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='subject') THEN
      UPDATE public.email_templates
      SET subject = REPLACE(REPLACE(subject, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE subject ILIKE '%siport%';
    END IF;
    -- update body/html_body/body_html/content depending on which exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='body') THEN
      UPDATE public.email_templates
      SET body = REPLACE(REPLACE(body, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE body ILIKE '%siport%';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='html_body') THEN
      UPDATE public.email_templates
      SET html_body = REPLACE(REPLACE(html_body, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE html_body ILIKE '%siport%';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_templates' AND column_name='content') THEN
      UPDATE public.email_templates
      SET content = REPLACE(REPLACE(content, 'SIPORT', 'SIB'), 'Siport', 'SIB')
      WHERE content ILIKE '%siport%';
    END IF;
    RAISE NOTICE 'email_templates updated';
  END IF;

  RAISE NOTICE 'Migration SIPORT → SIB terminée avec succès';
END $$;
