#!/usr/bin/env node
// Executes supabase/combined_apply.sql against DATABASE_URL
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Example (PowerShell): $env:DATABASE_URL="postgres://..."; node .\\scripts\\run_combined_sql.cjs');
  process.exit(1);
}

const sqlPath = path.resolve(__dirname, '..', 'supabase', 'combined_apply.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('Error: combined_apply.sql not found at', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

(async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected. Executing SQL script:', sqlPath);

    // Execute the whole script. combined_apply.sql contains its own BEGIN/COMMIT blocks.
    await client.query(sql);

    console.log('SQL script executed successfully.');
  } catch (err) {
    console.error('Execution failed:');
    console.error(err && err.message ? err.message : err);
    // Print full error for debugging
    console.error(err);
    process.exit(2);
  } finally {
    await client.end().catch(() => {});
  }
})();
