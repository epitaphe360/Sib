/*
  # Create articles_audio table for storing article audio files

  1. New Tables
    - `articles_audio`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key to news_articles)
      - `audio_url` (text) - URL du fichier audio dans Supabase Storage
      - `duration` (integer) - Durée en secondes
      - `language` (text) - Langue de l'audio (fr, en, ar)
      - `voice_type` (text) - Type de voix utilisée
      - `file_size` (bigint) - Taille du fichier en bytes
      - `status` (enum) - pending, processing, ready, error
      - `error_message` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create storage bucket for audio files
    - Configure public access policies

  3. Security
    - Enable RLS on `articles_audio` table
    - Add policy for public read access
    - Add policy for authenticated users to trigger conversion
    - Add policy for service role to manage audio files
    
  4. Indexes
    - Index on article_id for fast lookups
    - Index on status for filtering
*/

-- Create status enum
DO $$ BEGIN
  CREATE TYPE audio_status AS ENUM ('pending', 'processing', 'ready', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create articles_audio table
CREATE TABLE IF NOT EXISTS articles_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  audio_url text,
  duration integer,
  language text DEFAULT 'fr',
  voice_type text DEFAULT 'default',
  file_size bigint,
  status audio_status DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_audio_article_id ON articles_audio(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_audio_status ON articles_audio(status);
CREATE INDEX IF NOT EXISTS idx_articles_audio_language ON articles_audio(language);

-- Enable RLS
ALTER TABLE articles_audio ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read ready audio files
CREATE POLICY "Anyone can read ready audio files"
  ON articles_audio
  FOR SELECT
  USING (status = 'ready');

-- Policy: Authenticated users can request audio conversion
CREATE POLICY "Authenticated users can insert audio requests"
  ON articles_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Service role can manage all audio files
CREATE POLICY "Service role can manage audio files"
  ON articles_audio
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Service role can update audio status
CREATE POLICY "Service role can update audio files"
  ON articles_audio
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for article audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-audio',
  'article-audio',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public can read audio files
DROP POLICY IF EXISTS "Public can read audio files" ON storage.objects;
CREATE POLICY "Public can read audio files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'article-audio');

-- Storage policies: Authenticated users can upload audio files
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-audio');

-- Storage policies: Service role can manage audio files
DROP POLICY IF EXISTS "Service role can manage audio files" ON storage.objects;
CREATE POLICY "Service role can manage audio files"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'article-audio');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_audio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_articles_audio_updated_at_trigger ON articles_audio;
CREATE TRIGGER update_articles_audio_updated_at_trigger
  BEFORE UPDATE ON articles_audio
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_audio_updated_at();
