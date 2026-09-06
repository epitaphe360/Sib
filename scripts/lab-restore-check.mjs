/**
 * Restore / schema check against the Laboratoire project.
 * Usage: SUPABASE_ACCESS_TOKEN=... npm run lab:restore-check
 */
import 'dotenv/config';

const REF = process.env.LAB_SUPABASE_REF || 'omlhfjfpyttfvntfqjnk';
const token = process.env.SUPABASE_ACCESS_TOKEN;

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : data.message || res.statusText);
  return data;
}

async function main() {
  if (!token) {
    console.log(JSON.stringify({ ok: false, error: 'missing_token', doc: 'docs/RESTORE_TEST.md' }));
    process.exit(1);
  }
  const tables = await query(`
    select count(*)::int as n from information_schema.tables where table_schema='lab'
  `);
  const org = await query(`select slug from lab.organizations where slug='elitech'`);
  const fns = await query(`
    select count(*)::int as n from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='lab' and p.proname in
    ('claim_first_admin','accept_invite','submit_public_request','process_inbound_email')
  `);
  const ok = (tables[0]?.n ?? 0) >= 42 && org.length > 0 && (fns[0]?.n ?? 0) >= 3;
  console.log(JSON.stringify({
    ok,
    tables: tables[0]?.n,
    org: org[0]?.slug,
    required_fns: fns[0]?.n,
    restore_doc: 'docs/RESTORE_TEST.md',
  }));
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
