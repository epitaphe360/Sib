import pg from 'pg';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres.sbyizudifmqakzxjlndr:3Rl5h7UqncQQcFnL@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

const FILES = [
  '20260629000001_networking_contact_profiles_rpc.sql',
  '20260629000002_seed_visitor_demo_contacts.sql',
];

await client.connect();
try {
  for (const file of FILES) {
    const sql = readFileSync(join(root, 'supabase/migrations', file), 'utf8');
    console.log(`Applying ${file}…`);
    await client.query(sql);
    console.log(`✅ ${file}`);
  }

  const { rows } = await client.query(
    "SELECT proname FROM pg_proc WHERE proname = 'get_networking_contact_profiles'",
  );
  console.log('RPC deployed:', rows.length > 0);

  const { rows: connCount } = await client.query(`
    SELECT count(*)::int AS n FROM connections c
    JOIN auth.users u ON u.id = c.requester_id
    WHERE lower(u.email) = 'visiteur@sib.com'
  `);
  console.log('Connexions sortantes visiteur@sib.com:', connCount[0]?.n);
} finally {
  await client.end();
}
