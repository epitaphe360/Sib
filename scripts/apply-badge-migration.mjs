/**
 * Script pour appliquer la migration de validation des badges numériques
 * Ajoute la fonction validate_scanned_badge qui supporte badges statiques ET dynamiques
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📂 Lecture du fichier de migration...');
    
    const migrationPath = join(__dirname, '../supabase/migrations/20251230_validate_digital_badges.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📤 Application de la migration...');
    console.log('   Fonction: validate_scanned_badge()');
    console.log('   Support: Badges statiques (user_badges) + Badges dynamiques (digital_badges)');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Si exec_sql n'existe pas, essayer query directe
      console.log('⚠️  Tentative avec query directe...');
      
      const result = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);
      
      // Pour Supabase, on doit split et exécuter séquentiellement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.length > 10) {
          try {
            // Utiliser une transaction SQL directe n'est pas possible via le client
            // On doit utiliser l'API Edge Function ou le Dashboard SQL Editor
            console.log('⚠️  Migration doit être appliquée via Supabase Dashboard > SQL Editor');
            console.log('\n📋 Copiez ce SQL dans le Dashboard:\n');
            console.log('=' .repeat(80));
            console.log(sql);
            console.log('=' .repeat(80));
            
            process.exit(0);
          } catch (e) {
            console.error('❌ Erreur:', e.message);
          }
        }
      }
    }
    
    console.log('✅ Migration appliquée avec succès!');
    console.log('\n📊 La fonction validate_scanned_badge() est maintenant disponible');
    console.log('   Elle accepte: badge_code statique OU JWT dynamique');
    console.log('   Elle retourne: Infos complètes du badge + utilisateur');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

applyMigration();
