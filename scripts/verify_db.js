#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL or SUPABASE_DATABASE_URL must be set in the environment');
    console.error('You can set it in a .env or export it in your shell. Example (PowerShell):');
    console.error('\n$env:DATABASE_URL = "postgres://..."; node scripts/verify_db.js\n');
    process.exit(2);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log('Checking for function check_visitor_quota...');
  const fn = await client.query("SELECT proname FROM pg_proc WHERE proname ILIKE 'check_visitor_quota';");
  console.log('Function found:', fn.rowCount > 0);

  console.log('Checking for trigger trigger_check_visitor_quota...');
  const tg = await client.query("SELECT tgname, tgrelid::regclass AS table_name FROM pg_trigger WHERE tgname = 'trigger_check_visitor_quota';");
  console.log('Trigger found:', tg.rowCount > 0, tg.rows.map(r => r.table_name));

  console.log('Checking RLS on appointments...');
  const rls = await client.query("SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'appointments';");
  if (rls.rowCount === 0) {
    console.log('Table appointments not found');
  } else {
    console.log('RLS enabled:', rls.rows[0].relrowsecurity, 'Force RLS:', rls.rows[0].relforcerowsecurity);
  }

  console.log('Listing policies for appointments...');
  const policies = await client.query("SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='appointments';");
  console.log('Policies found:', policies.rowCount);
  policies.rows.forEach(p => console.log('-', p.policyname, p.cmd, p.roles));

  // Additional helpful checks
  try {
    const usersCol = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='visitor_level';");
    console.log('users.visitor_level present:', usersCol.rowCount > 0);
  } catch (e) {
    console.warn('Could not check users.visitor_level:', e.message || e);
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
