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

const file = '20260630000001_mobile_app_content_cms.sql';
const sql = readFileSync(join(root, 'supabase/migrations', file), 'utf8');

await client.connect();
try {
  console.log(`Applying ${file}…`);
  await client.query(sql);
  console.log(`✅ ${file}`);

  const { rows } = await client.query(
    "SELECT proname FROM pg_proc WHERE proname = 'get_mobile_app_content'",
  );
  console.log('RPC get_mobile_app_content:', rows.length > 0);

  const { rows: settings } = await client.query(
    "SELECT key FROM app_settings WHERE key = 'mobile_app_content_v1'",
  );
  console.log('app_settings seed:', settings.length > 0);
} finally {
  await client.end();
}
