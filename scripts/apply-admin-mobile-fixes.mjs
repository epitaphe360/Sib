/**
 * Applique les fonctions admin (tarif VIP, statut utilisateur, RLS visitor_levels).
 * Usage: node scripts/apply-admin-mobile-fixes.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(root, '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const sql = readFileSync(
  join(root, 'supabase/migrations/20260611000001_admin_mobile_fixes.sql'),
  'utf8'
);

console.log('ℹ️  Exécutez ce fichier dans Supabase → SQL Editor :');
console.log('   supabase/migrations/20260611000001_admin_mobile_fixes.sql');
console.log('');
console.log('   Ou : supabase db push (si l’historique des migrations est synchronisé)');
console.log('');
console.log('⚠️  exec_sql n’est pas disponible sur ce projet — copier/coller le SQL manuellement.');
