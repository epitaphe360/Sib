-- Fix public access policies for news articles and mini-site elements
-- Allow public read access to news articles and mini-site components

-- Disable RLS to update policies for news_articles
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news_articles') THEN
    ALTER TABLE news_articles DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read news" ON news_articles;
    DROP POLICY IF EXISTS "Public can read news" ON news_articles;
    DROP POLICY IF EXISTS "Authenticated users can read news" ON news_articles;
    ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read news"
      ON news_articles
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Fix mini-site elements: products
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read products" ON products;
    DROP POLICY IF EXISTS "Public can read products" ON products;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read products"
      ON products
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Fix mini-site elements: sections
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mini_site_sections') THEN
    ALTER TABLE mini_site_sections DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read mini-site sections" ON mini_site_sections;
    DROP POLICY IF EXISTS "Public can read mini-site sections" ON mini_site_sections;
    ALTER TABLE mini_site_sections ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read mini-site sections"
      ON mini_site_sections
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Fix any other mini-site related tables: documents
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read documents" ON documents;
    DROP POLICY IF EXISTS "Public can read documents" ON documents;
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read documents"
      ON documents
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Fix any other mini-site related tables: galleries
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'galleries') THEN
    ALTER TABLE galleries DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read galleries" ON galleries;
    DROP POLICY IF EXISTS "Public can read galleries" ON galleries;
    ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read galleries"
      ON galleries
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Fix mini-sites table
-- Only execute if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mini_sites') THEN
    ALTER TABLE mini_sites DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can read mini-sites" ON mini_sites;
    DROP POLICY IF EXISTS "Public can read mini-sites" ON mini_sites;
    ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public can read mini-sites"
      ON mini_sites
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;
