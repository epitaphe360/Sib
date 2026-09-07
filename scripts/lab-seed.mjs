/**
 * Apply Elitech Lab DEV seed on Laboratoire (omlhfjfpyttfvntfqjnk).
 * Never prints secrets. Passwords: docs/LAB_SEED.md or LAB_SEED_PASSWORD*.
 *
 *   npm run lab:seed
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (fs.existsSync(path.join(root, '.env.local'))) {
  dotenv.config({ path: path.join(root, '.env.local') });
}

const REF = process.env.LAB_SUPABASE_REF || 'omlhfjfpyttfvntfqjnk';
const LAB_URL = process.env.VITE_LAB_SUPABASE_URL || `https://${REF}.supabase.co`;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const DRY = process.argv.includes('--dry-run');

const USERS = [
  { id: '11111111-1111-4111-8111-111111111111', email: 'admin@elitech.dev', role: 'SUPER_ADMIN', fullName: 'Admin Elitech', kind: 'admin' },
  { id: '22222222-2222-4222-8222-222222222222', email: 'zineb@elitech.dev', role: 'RESPONSABLE_VALIDATION', fullName: 'Madame Zineb', kind: 'zineb' },
  { id: '33333333-3333-4333-8333-333333333333', email: 'tech@elitech.dev', role: 'RESPONSABLE_TECHNIQUE', fullName: 'Responsable technique', kind: 'tech' },
  { id: '44444444-4444-4444-8444-444444444444', email: 'client@elitech.dev', role: 'CLIENT', fullName: 'Client Atlas Oils', kind: 'client' },
];

const DEV_PASSWORDS = {
  admin: 'LabDev!2026Admin',
  zineb: 'LabDev!2026Zineb',
  tech: 'LabDev!2026Tech',
  client: 'LabDev!2026Client',
};

function passwordFor(kind) {
  const map = {
    admin: process.env.LAB_SEED_PASSWORD_ADMIN,
    zineb: process.env.LAB_SEED_PASSWORD_ZINEB,
    tech: process.env.LAB_SEED_PASSWORD_TECH,
    client: process.env.LAB_SEED_PASSWORD_CLIENT,
  };
  return map[kind] || process.env.LAB_SEED_PASSWORD || DEV_PASSWORDS[kind];
}

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
  if (!res.ok) {
    const message = typeof data === 'string' ? data : data.message || data.error || JSON.stringify(data).slice(0, 400);
    throw new Error(message);
  }
  return data;
}

async function labServiceRole() {
  const fromEnv = process.env.LAB_SUPABASE_SERVICE_ROLE_KEY;
  if (fromEnv) return fromEnv;
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'api-keys failed');
  const row = (Array.isArray(data) ? data : []).find((k) => k.name === 'service_role');
  return row?.api_key || row?.key || null;
}

async function ensureUsers(service) {
  const result = { created: 0, existing: 0, ids: {} };
  for (const user of USERS) {
    const password = passwordFor(user.kind);
    const create = await fetch(`${LAB_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${service}`,
        apikey: service,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName, seed: 'lab_elitech' },
      }),
    });
    if (create.ok) {
      const body = await create.json();
      result.created += 1;
      result.ids[user.email] = body.id || user.id;
      continue;
    }
    const listed = await fetch(`${LAB_URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: { Authorization: `Bearer ${service}`, apikey: service },
    });
    const listBody = await listed.json();
    const found = (listBody.users || []).find((u) => (u.email || '').toLowerCase() === user.email);
    if (!found) {
      throw new Error(`auth create failed for ${user.email}: ${create.status}`);
    }
    result.existing += 1;
    result.ids[user.email] = found.id;
    await fetch(`${LAB_URL}/auth/v1/admin/users/${found.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${service}`,
        apikey: service,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, email_confirm: true }),
    });
  }
  return result;
}

async function attachMembers(ids) {
  const admin = ids['admin@elitech.dev'];
  const zineb = ids['zineb@elitech.dev'];
  const tech = ids['tech@elitech.dev'];
  const client = ids['client@elitech.dev'];
  if (!admin || !zineb || !tech || !client) return;
  await query(`
    INSERT INTO lab.profiles (id, email, full_name)
    VALUES
      ('${admin}', 'admin@elitech.dev', 'Admin Elitech'),
      ('${zineb}', 'zineb@elitech.dev', 'Madame Zineb'),
      ('${tech}', 'tech@elitech.dev', 'Responsable technique'),
      ('${client}', 'client@elitech.dev', 'Client Atlas Oils')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    INSERT INTO lab.organization_members (organization_id, user_id, role, client_id)
    SELECT o.id, v.uid, v.role::lab.member_role, v.client
    FROM lab.organizations o
    JOIN (VALUES
      ('${admin}'::uuid, 'SUPER_ADMIN', NULL::uuid),
      ('${zineb}'::uuid, 'RESPONSABLE_VALIDATION', NULL),
      ('${tech}'::uuid, 'RESPONSABLE_TECHNIQUE', NULL),
      ('${client}'::uuid, 'CLIENT', 'a0c1e001-0001-4000-8000-000000000001'::uuid)
    ) AS v(uid, role, client) ON true
    WHERE o.slug = 'elitech'
    ON CONFLICT (organization_id, user_id) DO UPDATE
      SET role = EXCLUDED.role, client_id = EXCLUDED.client_id, deleted_at = NULL;
  `);
}

async function main() {
  if (!token) {
    console.log(JSON.stringify({
      ok: false,
      live: false,
      error: 'missing_token',
      next: 'Exporter SUPABASE_ACCESS_TOKEN (projet Laboratoire) puis npm run lab:seed',
      doc: 'docs/LAB_SEED.md',
    }));
    process.exit(1);
  }
  if (DRY) {
    console.log(JSON.stringify({ ok: true, dryRun: true, org: 'elitech', accounts: USERS.map((u) => u.email) }));
    return;
  }

  let migration07 = false;
  let migration08 = false;
  const calls = await query(`select to_regclass('lab.client_calls') as t`);
  if (!calls[0]?.t) {
    const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260906000007_lab_cdc_gaps.sql'), 'utf8');
    await query(sql);
    migration07 = true;
  }
  const cats = await query(`select to_regclass('lab.sample_categories') as t`);
  if (!cats[0]?.t) {
    const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260907000008_lab_qualification.sql'), 'utf8');
    await query(sql);
    migration08 = true;
  }

  const service = await labServiceRole();
  let users = { created: 0, existing: 0, ids: {} };
  if (service) {
    users = await ensureUsers(service);
  }

  const demoSql = fs.readFileSync(path.join(root, 'supabase/seeds/lab_elitech_demo.sql'), 'utf8');
  await query(demoSql);
  if (Object.keys(users.ids).length) {
    await attachMembers(users.ids);
  }

  const counts = {
    requests: (await query(`select count(*)::int as n from lab.client_requests where dossier_number like 'DEM-SEED-%'`))[0]?.n,
    quotes: (await query(`select count(*)::int as n from lab.quotes where quote_number like 'DEV-SEED-%'`))[0]?.n,
    samples: (await query(`select count(*)::int as n from lab.samples where code like 'ECH-00090%'`))[0]?.n,
    invoices: (await query(`select count(*)::int as n from lab.client_invoices where invoice_number like 'FAC-SEED-%'`))[0]?.n,
    tasks: (await query(`select count(*)::int as n from lab.tasks where title like '[LAB_SEED]%'`))[0]?.n,
    members: (await query(`select count(*)::int as n from lab.organization_members m join lab.organizations o on o.id=m.organization_id where o.slug='elitech' and m.deleted_at is null`))[0]?.n,
  };

  console.log(JSON.stringify({
    ok: counts.requests >= 12,
    live: true,
    org: 'elitech',
    project: REF,
    migration07,
    migration08,
    usersCreated: users.created,
    usersExisting: users.existing,
    usersAttached: Boolean(service),
    ...counts,
    login: '/lab/login',
    doc: 'docs/LAB_SEED.md',
  }));
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, live: false, error: e instanceof Error ? e.message : 'seed_failed', doc: 'docs/LAB_SEED.md' }));
  process.exit(1);
});
