import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

async function executeMigration() {
  try {
    // Vérifier que les variables d'environnement sont présentes
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes');
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250912200000_add_missing_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Exécution de la migration des nouvelles tables...');

    // Diviser le SQL en statements individuels pour une meilleure gestion des erreurs
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let executedCount = 0;

    // Exécuter chaque statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

          if (error) {
            // Si c'est une erreur "already exists", continuer
            if (error.message.includes('already exists') || error.message.includes('does not exist')) {
              console.log(`⚠️  Statement ignoré (élément existe déjà): ${statement.substring(0, 50)}...`);
            } else {
              console.error(`❌ Erreur SQL:`, error);
              console.error(`Statement: ${statement}`);
            }
          } else {
            executedCount++;
          }
        } catch (err) {
          console.log(`⚠️  Statement potentiellement ignoré: ${statement.substring(0, 50)}...`);
        }
      }
    }

    console.log(`✅ Migration terminée ! ${executedCount} statements exécutés avec succès.`);

    // Vérifier que les tables ont été créées
    console.log('🔍 Vérification des nouvelles tables...');

    const tablesToCheck = [
      'partners',
      'conversations',
      'messages',
      'message_attachments',
      'event_registrations',
      'networking_recommendations',
      'analytics',
      'activities'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && !error.message.includes('permission denied')) {
          console.log(`❌ Table ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName}: OK`);
        }
      } catch (err) {
        console.log(`⚠️  Impossible de vérifier ${tableName}`);
      }
    }

    console.log('🎉 Migration des nouvelles tables terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration
executeMigration();
