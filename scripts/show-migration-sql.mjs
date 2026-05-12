import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL pour créer les colonnes
const migrationSQL = `
-- Ajouter les colonnes une par une
ALTER TABLE partners ADD COLUMN IF NOT EXISTS mission text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS vision text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS values_list jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS clients jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS established_year integer;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS employees text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';
`;

console.log('====================================================');
console.log('MIGRATION SQL À EXÉCUTER DANS SUPABASE SQL EDITOR');
console.log('====================================================');
console.log('\n1. Ouvrez https://supabase.com/dashboard');
console.log('2. Sélectionnez votre projet: sbyizudifmqakzxjlndr');
console.log('3. Allez dans SQL Editor (icône terminal à gauche)');
console.log('4. Collez et exécutez le SQL suivant:\n');
console.log('----------------------------------------------------');
console.log(migrationSQL);
console.log('----------------------------------------------------');
console.log('\n5. Cliquez sur "Run" pour exécuter');
console.log('\nUne fois fait, relancez: node scripts/apply-partners-migration.mjs');
