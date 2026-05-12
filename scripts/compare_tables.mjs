import fetch from 'node-fetch';
import fs from 'fs';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  const h = { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` };
  const d1 = await (await fetch(`${SUPABASE_URL}/rest/v1/exhibitors?select=company_name`, { headers: h })).json();
  const d2 = await (await fetch(`${SUPABASE_URL}/rest/v1/exhibitor_profiles?select=company_name`, { headers: h })).json();

  let out = '=== EXHIBITORS ===\n';
  d1.forEach(e => out += e.company_name + '\n');
  out += '\n=== EXHIBITOR_PROFILES ===\n';
  d2.forEach(e => out += e.company_name + '\n');

  fs.writeFileSync('compare_tables_node.txt', out);
}
run();
