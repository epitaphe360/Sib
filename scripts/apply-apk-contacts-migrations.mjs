/**
 * Applique les migrations RPC + contacts démo sur Supabase (service_role + rpc exec).
 * Usage: node scripts/apply-apk-contacts-migrations.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv(join(root, '.env'));
const url = env.VITE_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const admin = createClient(url, key);

const FILES = [
  '20260629000001_networking_contact_profiles_rpc.sql',
  '20260629000002_seed_visitor_demo_contacts.sql',
];

async function execSql(label, sql) {
  console.log(`\n⚡ ${label}…`);
  const { error } = await admin.rpc('exec', { sql });
  if (error) {
    console.error(`❌ ${label}:`, error.message);
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

async function main() {
  for (const file of FILES) {
    const sql = readFileSync(join(root, 'supabase/migrations', file), 'utf8');
    const ok = await execSql(file, sql);
    if (!ok) {
      console.log('\n⚠️  Appliquez manuellement dans Supabase SQL Editor:');
      console.log(`   supabase/migrations/${file}`);
      process.exit(1);
    }
  }

  const { data: vis } = await admin.auth.admin.listUsers();
  const visitor = vis?.users?.find((u) => u.email === 'visiteur@sib.com');
  if (!visitor) {
    console.log('\n⚠️ visiteur@sib.com introuvable');
    return;
  }

  const partnerId = '6ee3fa36-ad30-4032-bad3-84f414291070'; // from earlier - use dynamic
  const { data: conns } = await admin
    .from('connections')
    .select('addressee_id, requester_id')
    .eq('requester_id', visitor.id)
    .limit(1);

  const targetId = conns?.[0]?.addressee_id;
  if (targetId) {
    const { data: profiles, error } = await admin.rpc('get_networking_contact_profiles', {
      p_ids: [targetId],
    });
    if (error) console.error('RPC test:', error.message);
    else console.log('\n✓ RPC test profil:', profiles?.[0]?.name ?? '(vide)');
  }

  console.log('\n✅ Migrations APK contacts appliquées.');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
