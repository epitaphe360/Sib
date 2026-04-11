/**
 * Script pour créer automatiquement les tables Supabase
 * Exécute le fichier supabase_content_tables.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  CRÉATION DES TABLES SUPABASE');
  console.log('  SIPORTS 2026 - Contenu Site Vitrine');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Lire le fichier SQL
    const sqlFilePath = join(__dirname, '..', 'supabase_content_tables.sql');
    console.log('📖 Lecture du fichier SQL...');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`✓ ${commands.length} commandes SQL à exécuter\n`);

    let successCount = 0;
    let errorCount = 0;

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      
      // Ignorer les commentaires
      if (cmd.startsWith('--') || cmd.length < 10) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: cmd + ';' });
        
        if (error) {
          // Certaines erreurs sont acceptables (table existe déjà, etc.)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  ${i + 1}/${commands.length} - Déjà existant (ignoré)`);
            successCount++;
          } else {
            console.error(`✗ ${i + 1}/${commands.length} - Erreur:`, error.message.substring(0, 80));
            errorCount++;
          }
        } else {
          console.log(`✓ ${i + 1}/${commands.length} - OK`);
          successCount++;
        }
      } catch (err) {
        console.error(`✗ ${i + 1}/${commands.length} - Exception:`, err.message.substring(0, 80));
        errorCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  ✅ ${successCount} commandes réussies`);
    console.log(`  ${errorCount > 0 ? '⚠️' : '✅'} ${errorCount} erreurs`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Vérifier les tables créées
    console.log('🔍 Vérification des tables...\n');
    
    const tables = [
      'news_articles',
      'article_tags', 
      'media_library',
      'testimonials',
      'static_pages',
      'faq_items',
      'site_config',
      'newsletter_subscribers'
    ];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`  ✗ ${table}: ${error.message}`);
      } else {
        console.log(`  ✓ ${table}: OK`);
      }
    }

    console.log('\n✅ Configuration Supabase terminée!\n');
    console.log('💡 Prochaine étape: Exécuter la migration WordPress');
    console.log('   node scripts/migrate-wordpress-to-supabase.mjs\n');

  } catch (error) {
    console.error('\n❌ Erreur critique:', error.message);
    console.error('\n💡 Solution alternative: Exécuter le SQL manuellement dans Supabase Dashboard');
    console.error('   https://app.supabase.com/project/eqjoqgpbxhsfgcovipgu/sql/new\n');
    process.exit(1);
  }
}

executeSQL();
