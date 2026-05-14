import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres.sbyizudifmqakzxjlndr:3Rl5h7UqncQQcFnL@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
await client.connect();
const r = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
console.log(r.rows.map(x => x.tablename).join('\n'));
await client.end();
