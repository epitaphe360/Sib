-- Fix public access policies for news_articles
-- Allow public read access to news articles

-- Disable RLS to update policies
ALTER TABLE news_articles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read news" ON news_articles;
DROP POLICY IF EXISTS "Public can read news" ON news_articles;
DROP POLICY IF EXISTS "Authenticated users can read news" ON news_articles;

-- Re-enable RLS with public policy
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create simple public read policy for news articles
CREATE POLICY "Public can read news"
  ON news_articles
  FOR SELECT
  TO public
  USING (true);

-- Only admins can create/update/delete news
CREATE POLICY "Admins can manage news"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
