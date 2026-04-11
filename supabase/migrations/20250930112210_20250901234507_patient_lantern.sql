/*
  # Create mini_sites table

  1. New Tables
    - `mini_sites`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `theme` (text)
      - `custom_colors` (jsonb)
      - `sections` (jsonb)
      - `published` (boolean)
      - `views` (integer)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `mini_sites` table
    - Add policies for exhibitors to manage their own mini-sites
    - Add policies for public read access to published sites
*/

-- Create mini_sites table
CREATE TABLE IF NOT EXISTS mini_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'modern',
  custom_colors jsonb DEFAULT '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#60a5fa"}',
  sections jsonb DEFAULT '[]',
  published boolean DEFAULT false,
  views integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Anyone can read published mini-sites') THEN
    CREATE POLICY "Anyone can read published mini-sites"
      ON mini_sites
      FOR SELECT
      TO authenticated
      USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Exhibitors can manage own mini-sites') THEN
    CREATE POLICY "Exhibitors can manage own mini-sites"
      ON mini_sites
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM exhibitors e
          JOIN users u ON e.user_id = u.id
          WHERE e.id = mini_sites.exhibitor_id 
          AND auth.uid()::text = u.id::text
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mini_sites' AND policyname = 'Admins can manage all mini-sites') THEN
    CREATE POLICY "Admins can manage all mini-sites"
      ON mini_sites
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id::text = auth.uid()::text 
          AND type = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated trigger
DROP TRIGGER IF EXISTS update_mini_sites_last_updated ON mini_sites;
CREATE TRIGGER update_mini_sites_last_updated
  BEFORE UPDATE ON mini_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();