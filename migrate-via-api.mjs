#!/usr/bin/env node
// Script pour appliquer les migrations restantes via API Management Supabase
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'sbyizudifmqakzxjlndr';
const ACCESS_TOKEN = 'sbp_e024a52d37f946ace04d913134cc5d29197c5bbe';
const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function queryDB(sql) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function getAppliedMigrations() {
  const rows = await queryDB(
    "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version"
  );
  return new Set(rows.map(r => r.version));
}

async function markMigrationApplied(version, name, statements) {
  // Insert into schema_migrations
  const stmtCount = Array.isArray(statements) ? statements.length : 1;
  await queryDB(
    `INSERT INTO supabase_migrations.schema_migrations (version, name, statements) 
     VALUES ('${version}', '${name.replace(/'/g, "''")}', ARRAY[${statements.map(s => `$STR$${s}$STR$`).join(',')}])
     ON CONFLICT (version) DO NOTHING`
  );
}

function extractVersion(filename) {
  // Extract timestamp prefix from filename like 20241219_xxx.sql or 20241219000000_xxx.sql
  const match = filename.match(/^(\d+)_/);
  return match ? match[1] : null;
}

async function applyMigration(filepath, version, filename) {
  const sql = fs.readFileSync(filepath, 'utf-8');
  
  console.log(`\nApplying: ${filename}`);
  
  try {
    await queryDB(sql);
    console.log(`  ✓ Success`);
    
    // Try to mark in schema_migrations
    try {
      await queryDB(
        `INSERT INTO supabase_migrations.schema_migrations (version, name, statements) 
         VALUES ('${version}', '${filename.replace('.sql', '').replace(/'/g, "''")}', ARRAY['${sql.replace(/'/g, "''").substring(0, 100)}...'])
         ON CONFLICT (version) DO NOTHING`
      );
    } catch (e) {
      // Ignore errors marking migration - not critical
    }
    return true;
  } catch (err) {
    const errMsg = err.message;
    
    // Check for duplicate object errors (safely ignorable)
    if (errMsg.includes('already exists') || 
        errMsg.includes('duplicate_object') ||
        errMsg.includes('duplicate key') ||
        errMsg.includes('DuplicateTable') ||
        errMsg.includes('42P07') || // duplicate table
        errMsg.includes('42710')) { // duplicate object
      console.log(`  ⚠ Skipped (already exists): ${errMsg.substring(0, 100)}`);
      try {
        await queryDB(
          `INSERT INTO supabase_migrations.schema_migrations (version, name, statements) 
           VALUES ('${version}', '${filename.replace('.sql', '').replace(/'/g, "''")}', ARRAY['already_existed'])
           ON CONFLICT (version) DO NOTHING`
        );
      } catch (e) { /* ignore */ }
      return true;
    }
    
    console.error(`  ✗ ERROR: ${errMsg.substring(0, 200)}`);
    return false;
  }
}

async function main() {
  console.log('=== Migration via API Management Supabase ===\n');
  
  // Get already applied migrations
  console.log('Fetching applied migrations...');
  const applied = await getAppliedMigrations();
  console.log(`Already applied: ${applied.size} migrations`);
  applied.forEach(v => console.log(`  - ${v}`));
  
  // Get all migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`\nTotal migration files: ${files.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const filename of files) {
    const version = extractVersion(filename);
    
    if (!version) {
      console.log(`\nSkipping (no valid timestamp): ${filename}`);
      skippedCount++;
      continue;
    }
    
    if (applied.has(version)) {
      console.log(`Already applied: ${filename}`);
      skippedCount++;
      continue;
    }
    
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const ok = await applyMigration(filepath, version, filename);
    
    if (ok) {
      successCount++;
      applied.add(version);
    } else {
      errorCount++;
      // Continue with next migration despite error
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`✓ Applied: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log(`- Skipped: ${skippedCount}`);
  
  // Verify final state
  console.log('\nVerifying table count...');
  const tables = await queryDB(
    "SELECT count(*) as cnt FROM information_schema.tables WHERE table_schema = 'public'"
  );
  console.log(`Tables in public schema: ${tables[0].cnt}`);
}

main().catch(console.error);
