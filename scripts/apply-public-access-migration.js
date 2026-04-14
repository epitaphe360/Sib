import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyPublicAccessMigration() {
  try {
    console.log('🚀 Application de la migration d\'accès public...\n');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250915000000_public_access_fix.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration SQL chargée avec succès');
    console.log(`📊 Taille du fichier: ${migrationSQL.length} caractères\n`);

    // Ouvrir le dashboard Supabase dans le navigateur
    console.log('🌐 Ouverture du dashboard Supabase...');
    try {
      if (process.platform === 'win32') {
        await execAsync('start https://supabase.com/dashboard');
      } else if (process.platform === 'darwin') {
        await execAsync('open https://supabase.com/dashboard');
      } else {
        await execAsync('xdg-open https://supabase.com/dashboard');
      }
      console.log('✅ Dashboard Supabase ouvert dans votre navigateur\n');
    } catch (error) {
      console.log('⚠️  Impossible d\'ouvrir automatiquement le navigateur');
      console.log('🔗 Veuillez ouvrir manuellement: https://supabase.com/dashboard\n');
    }

    console.log('📝 INSTRUCTIONS POUR APPLIQUER LA MIGRATION:');
    console.log('='.repeat(50));
    console.log('1. Connectez-vous à votre compte Supabase');
    console.log('2. Sélectionnez votre projet SIB');
    console.log('3. Allez dans l\'onglet "SQL Editor"');
    console.log('4. Cliquez sur "New Query"');
    console.log('5. Copiez-collez tout le contenu ci-dessous:');
    console.log('='.repeat(50));
    console.log('');

    console.log('--- DÉBUT DU SQL À COPIER ---');
    console.log(migrationSQL);
    console.log('--- FIN DU SQL ---');

    console.log('');
    console.log('='.repeat(50));
    console.log('6. Cliquez sur "Run" pour exécuter la migration');
    console.log('='.repeat(50));

    console.log('\n🎯 CE QUE CETTE MIGRATION FAIT:');
    console.log('  • Permet l\'accès public aux exposants (liste et détails)');
    console.log('  • Permet l\'accès public aux mini-sites publiés');
    console.log('  • Garde les fonctionnalités de contact (rendez-vous, messages) réservées aux utilisateurs authentifiés');

    console.log('\n✨ Migration prête ! Suivez les instructions ci-dessus.');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter la configuration
applyPublicAccessMigration();
