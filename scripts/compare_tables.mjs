import fetch from 'node-fetch';
import fs from 'fs';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

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
