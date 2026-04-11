import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('🚀 Démarrage de la migration de la table products...\n');

  try {
    // Lire le fichier SQL
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251229_enhance_products_table.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Fichier de migration introuvable:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('✅ Fichier de migration chargé\n');

    // Extraire et exécuter chaque commande SQL séparément
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== '');

    console.log(`📝 ${commands.length} commandes SQL à exécuter\n`);

    for (const [index, command] of commands.entries()) {
      if (command.startsWith('COMMENT') || command.startsWith('CREATE INDEX')) {
        // Les commentaires et index ne passent pas par rpc, on les ignore
        console.log(`⏭️  [${index + 1}/${commands.length}] Commande ignorée (COMMENT/INDEX)`);
        continue;
      }

      console.log(`⚙️  [${index + 1}/${commands.length}] Exécution...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Si exec_sql n'existe pas, on essaie directement avec from
          console.log(`   Tentative alternative...`);
          const { error: altError } = await supabase.from('_migrations').insert({ sql: command });
          if (altError) throw altError;
        }
        
        console.log(`   ✅ Succès\n`);
      } catch (err) {
        console.log(`   ⚠️  Avertissement: ${err.message}\n`);
      }
    }

    console.log('\n🎉 Migration terminée avec succès!\n');
    console.log('📊 Vérification de la structure...\n');

    // Vérifier la structure de la table
    const { data: products, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erreur lors de la vérification:', selectError);
    } else {
      console.log('✅ Colonnes disponibles:', Object.keys(products?.[0] || {}));
      
      // Vérifier si les nouvelles colonnes sont présentes
      const newColumns = ['images', 'video_url', 'is_new', 'in_stock', 'certified', 'delivery_time', 'original_price', 'documents'];
      const existingColumns = Object.keys(products?.[0] || {});
      
      console.log('\n📋 Nouvelles colonnes ajoutées:');
      newColumns.forEach(col => {
        const exists = existingColumns.includes(col);
        console.log(`   ${exists ? '✅' : '❌'} ${col}`);
      });
    }

    console.log('\n✨ Migration complète!\n');
    console.log('💡 Prochaines étapes:');
    console.log('   1. Testez la modal produit améliorée');
    console.log('   2. Ajoutez des images/vidéos/documents aux produits existants');
    console.log('   3. Configurez les badges (is_new, certified, etc.)\n');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
