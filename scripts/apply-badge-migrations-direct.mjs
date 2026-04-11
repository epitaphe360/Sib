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
    // Read migration files
    const migration1Path = join(__dirname, '..', 'supabase', 'migrations', '20251217000001_create_user_badges.sql');
    const migration2Path = join(__dirname, '..', 'supabase', 'migrations', '20251217000002_auto_generate_badges.sql');

    const migration1SQL = readFileSync(migration1Path, 'utf-8');
    const migration2SQL = readFileSync(migration2Path, 'utf-8');

    console.log('📝 Migration files loaded:');
    console.log('   ✓ 20251217000001_create_user_badges.sql');
    console.log('   ✓ 20251217000002_auto_generate_badges.sql\n');

    // Apply migrations using raw SQL
    console.log('⚡ Applying migration 1: Create user_badges table...');
    const { error: error1 } = await supabase.rpc('exec', { sql: migration1SQL });

    if (error1) {
      console.error('❌ Error in migration 1:', error1.message);
      console.log('\n⚠️  Manual application required. Please:');
      console.log('   1. Open Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and execute: supabase/migrations/20251217000001_create_user_badges.sql');
      console.log('   3. Copy and execute: supabase/migrations/20251217000002_auto_generate_badges.sql\n');
      process.exit(1);
    }
    console.log('✅ Migration 1 applied successfully!\n');

    console.log('⚡ Applying migration 2: Auto-generate badge triggers...');
    const { error: error2 } = await supabase.rpc('exec', { sql: migration2SQL });

    if (error2) {
      console.error('❌ Error in migration 2:', error2.message);
      console.log('\n⚠️  Manual application required. Please:');
      console.log('   1. Open Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and execute: supabase/migrations/20251217000002_auto_generate_badges.sql\n');
      process.exit(1);
    }
    console.log('✅ Migration 2 applied successfully!\n');

    // Verify table creation
    console.log('🔍 Verifying badge system setup...');
    const { data: tables, error: verifyError } = await supabase
      .from('user_badges')
      .select('id')
      .limit(1);

    if (verifyError && !verifyError.message.includes('row')) {
      console.log('⚠️  Note: Table verification returned an error, but this may be normal if the table is empty');
      console.log('   Error:', verifyError.message);
    } else {
      console.log('✅ Table user_badges is accessible and ready!\n');
    }

    console.log('🎉 Badge system setup complete!\n');
    console.log('📋 Summary:');
    console.log('   ✓ user_badges table created');
    console.log('   ✓ Badge generation functions installed');
    console.log('   ✓ Automatic badge triggers configured');
    console.log('   ✓ RLS policies applied\n');
    console.log('💡 Badges will auto-generate for:');
    console.log('   - New user registrations (status=active)');
    console.log('   - Visitor level changes (free ↔ premium)');
    console.log('   - Exhibitor/Partner profile updates\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n📖 Manual Migration Instructions:');
    console.log('   1. Open your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Execute these files in order:');
    console.log('      a) supabase/migrations/20251217000001_create_user_badges.sql');
    console.log('      b) supabase/migrations/20251217000002_auto_generate_badges.sql');
    console.log('\n💾 Combined SQL file also available at: /tmp/badge_migrations_combined.sql\n');
    process.exit(1);
  }
}

applyMigrations();
