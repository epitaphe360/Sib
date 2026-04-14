import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupMigration() {
  try {
    console.log('🚀 Configuration automatique de la migration Supabase...\n');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250912200000_add_missing_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration SQL chargée avec succès');
    console.log(`📊 Taille du fichier: ${migrationSQL.length} caractères\n`);

    // Ouvrir le dashboard Supabase dans le navigateur
    console.log('🌐 Ouverture du dashboard Supabase...');
    try {
      // Essayer d'ouvrir dans le navigateur par défaut
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

    console.log('📝 INSTRUCTIONS POUR LA MIGRATION:');
    console.log('='.repeat(50));
    console.log('1. Connectez-vous à votre compte Supabase');
    console.log('2. Sélectionnez votre projet SIB');
    console.log('3. Allez dans l\'onglet "SQL Editor"');
    console.log('4. Cliquez sur "New Query"');
    console.log('5. Copiez-collez tout le contenu ci-dessous:');
    console.log('='.repeat(50));
    console.log('');

    // Afficher le SQL avec des marqueurs pour faciliter la copie
    console.log('--- DÉBUT DU SQL À COPIER ---');
    console.log(migrationSQL);
    console.log('--- FIN DU SQL ---');

    console.log('');
    console.log('='.repeat(50));
    console.log('6. Cliquez sur "Run" pour exécuter la migration');
    console.log('7. Vérifiez que toutes les tables sont créées');
    console.log('='.repeat(50));

    console.log('\n🎯 TABLES QUI SERONT CRÉÉES:');
    const tables = [
      'partners - Table dédiée aux partenaires',
      'conversations - Gestion des conversations chat',
      'messages - Messages individuels du chat',
      'message_attachments - Pièces jointes des messages',
      'event_registrations - Inscriptions aux événements',
      'networking_recommendations - Recommandations IA',
      'analytics - Analyses et métriques détaillées',
      'activities - Suivi des activités utilisateurs'
    ];

    tables.forEach(table => console.log(`  • ${table}`));

    console.log('\n⚡ FONCTIONNALITÉS DÉBLOQUÉES APRÈS MIGRATION:');
    console.log('  • Système de chat complet');
    console.log('  • Gestion des partenaires');
    console.log('  • Inscriptions aux événements');
    console.log('  • Recommandations de networking IA');
    console.log('  • Analytics avancés');
    console.log('  • Suivi des activités utilisateurs');

    console.log('\n✨ Migration prête ! Suivez les instructions ci-dessus.');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Exécuter la configuration
setupMigration();
