// Usage: SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=your_key node scripts/check_supabase_tables.js
// This script performs simple checks on a few tables via Supabase REST API.

const TABLES = ['users', 'connections', 'user_favorites', 'favorites', 'registration_requests', 'partners', 'exhibitors'];

async function checkTable(supabaseUrl, supabaseKey, table) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=*&limit=1`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json'
      }
    });

    const text = await res.text();
    if (res.ok) {
      console.log(`${table}: OK (200). Sample response length=${text.length}`);
      return { table, status: res.status, ok: true };
    }

    // Not ok
    console.warn(`${table}: HTTP ${res.status} - ${res.statusText}`);
    console.warn('> Response body:', text);
    return { table, status: res.status, ok: false, body: text };
  } catch (err) {
    console.error(`${table}: ERROR`, err.message || err);
    return { table, status: null, ok: false, error: String(err) };
  }
}

(async function main(){
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
    console.error('Example: SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=your_key node scripts/check_supabase_tables.js');
    process.exit(1);
  }

  console.log('Checking Supabase tables using REST API...');
  const results = [];
  for (const t of TABLES) {
    // small delay to avoid throttling
    await new Promise(r => setTimeout(r, 150));
    // eslint-disable-next-line no-await-in-loop
    const r = await checkTable(supabaseUrl, supabaseKey, t);
    results.push(r);
  }

  console.log('\nSummary:');
  for (const r of results) {
    if (r.ok) console.log(`- ${r.table}: OK`);
    else console.log(`- ${r.table}: FAIL (status=${r.status})`);
  }

  console.log('\nIf a table fails with 400/404, check that the table exists and that the provided key has sufficient permissions (or use a service_role key for full access).');
})();
