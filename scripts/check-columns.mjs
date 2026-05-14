import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres.sbyizudifmqakzxjlndr:3Rl5h7UqncQQcFnL@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});
await client.connect();

// Policies qui référencent 'profiles'
const r = await client.query(`
  SELECT tablename, policyname, qual
  FROM pg_policies
  WHERE qual ILIKE '%profiles%'
`);
console.log('Policies with profiles ref:');
r.rows.forEach(x => console.log(` - ${x.tablename}: ${x.policyname}`));

await client.end();

