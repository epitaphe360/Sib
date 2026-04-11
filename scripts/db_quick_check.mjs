#!/usr/bin/env node
import dotenv from 'dotenv';
import { Client } from 'pg';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL in .env to run quick check');
  process.exit(1);
}

(async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const counts = await client.query("SELECT count(*) AS exhibitors_count FROM public.exhibitors;");
    console.log('Exhibitors count:', counts.rows[0].exhibitors_count);

    const policies = await client.query("SELECT tbl.relname AS table_name, pol.polname AS policy_name, pg_get_expr(pol.polqual, pol.polrelid) AS using_expr FROM pg_policy pol JOIN pg_class tbl ON pol.polrelid = tbl.oid WHERE tbl.relname IN ('exhibitors','products','mini_sites','users') ORDER BY tbl.relname, pol.polname;");
    console.log('Policies:');
    for (const r of policies.rows) {
      console.log(`- ${r.table_name} :: ${r.policy_name} :: using=${r.using_expr}`);
    }

    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='exhibitors' ORDER BY ordinal_position;");
    console.log('Exhibitor columns:', cols.rows.map(r => r.column_name).join(', '));

  } catch (err) {
    console.error('Quick check failed:', err.message || err);
  } finally {
    await client.end();
  }
})();
