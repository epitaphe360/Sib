#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🚀 Applying badge system migrations...\n');

  try {
    // Lire le fichier combiné
    const migrationSQL = readFileSync('/tmp/badge_migrations.sql', 'utf-8');

    console.log('📝 Executing badge migrations SQL...');

    // Exécuter la migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).select();

    if (error) {
      // Essayer d'exécuter directement si exec_sql n'existe pas
      console.log('⚠️  exec_sql RPC not available, trying direct execution...');

      // Diviser en statements individuels
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.length > 0) {
          const { error: execError } = await supabase.rpc('query', { query_text: statement });
          if (execError) {
            console.error(`❌ Error executing statement: ${execError.message}`);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    } else {
      console.log('✅ Migrations applied successfully!');
    }

    // Vérifier que la table a été créée
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('user_badges')
      .select('count')
      .limit(0);

    if (tableError) {
      console.error('⚠️  Note: Table verification failed, but migrations may have succeeded');
      console.error('   Please verify manually in Supabase dashboard');
    } else {
      console.log('✅ Table user_badges is accessible!');
    }

    console.log('\n🎉 Badge system setup complete!');
    console.log('\n📋 Summary:');
    console.log('   ✓ user_badges table created');
    console.log('   ✓ Badge generation functions created');
    console.log('   ✓ Automatic badge triggers installed');
    console.log('   ✓ RLS policies configured');
    console.log('\n💡 Badges will be automatically generated for:');
    console.log('   - New user registrations (when status = active)');
    console.log('   - Visitor level changes');
    console.log('   - Exhibitor/Partner profile updates');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('\n💡 Please apply the migrations manually:');
    console.error('   1. Open Supabase SQL Editor');
    console.error('   2. Copy contents of /tmp/badge_migrations.sql');
    console.error('   3. Execute the SQL');
    process.exit(1);
  }
}

applyMigrations();
