/*
  # Create news articles table

  1. New Tables
    - `news_articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `author` (text)
      - `published_at` (timestamp)
      - `category` (text)
      - `tags` (text array)
      - `featured` (boolean)
      - `image` (text, optional)
      - `read_time` (integer)
      - `source` (text)
      - `source_url` (text, optional)
      - `views` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `news_articles` table
    - Add policies for public read and admin management
*/

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  published_at timestamptz NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  image text,
  read_time integer DEFAULT 5,
  source text DEFAULT 'siports',
  source_url text,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published articles"
  ON news_articles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage articles"
  ON news_articles
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = auth.uid()::text 
    AND users.type = 'admin'::user_type
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();