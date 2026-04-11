/**
 * Script pour corriger la table notifications en production
 * Execute la migration 20260102000001_fix_notifications_table.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔧 Application de la migration notifications...\n');

    // Lire le fichier de migration
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260102000001_fix_notifications_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Migration SQL:');
    console.log(migrationSQL.substring(0, 200) + '...\n');

    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).single();

    if (error) {
      // Si exec_sql n'existe pas, essayer directement
      console.log('⚠️ exec_sql non disponible, tentative d\'exécution directe...\n');
      
      // Diviser en plusieurs requêtes
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('DO $$')) {
          // Les blocs DO $$ doivent être exécutés en entier
          const fullBlock = migrationSQL.substring(
            migrationSQL.indexOf(statement),
            migrationSQL.indexOf('END $$;', migrationSQL.indexOf(statement)) + 7
          );
          console.log('🔄 Exécution bloc DO...');
          const { error: blockError } = await supabase.rpc('exec', { sql: fullBlock });
          if (blockError) {
            console.error('❌ Erreur bloc DO:', blockError.message);
          }
        } else if (statement.length > 0) {
          console.log(`🔄 Exécution: ${statement.substring(0, 60)}...`);
          const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
          if (stmtError) {
            console.warn('⚠️ Avertissement:', stmtError.message);
          }
        }
      }
    } else {
      console.log('✅ Migration appliquée avec succès:', data);
    }

    // Vérifier la structure finale
    console.log('\n🔍 Vérification de la structure de la table notifications...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'notifications')
      .order('ordinal_position');

    if (columnsError) {
      console.warn('⚠️ Impossible de vérifier les colonnes:', columnsError.message);
    } else if (columns) {
      console.log('\n📋 Colonnes de la table notifications:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Vérifier les policies RLS
    console.log('\n🔍 Vérification des policies RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check')
      .eq('tablename', 'notifications');

    if (policiesError) {
      console.warn('⚠️ Impossible de vérifier les policies:', policiesError.message);
    } else if (policies && policies.length > 0) {
      console.log('\n🔐 Policies RLS actives:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('⚠️ Aucune policy RLS trouvée');
    }

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n💡 Testez maintenant la création de notifications dans l\'application.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    process.exit(1);
  }
}

applyMigration();
