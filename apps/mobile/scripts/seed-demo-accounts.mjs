/**
 * Crée les comptes démo (auth + public.users) via service_role.
 * Ajoutez dans apps/mobile/.env : VITE_SUPABASE_SERVICE_ROLE_KEY=...
 * Ou à la racine du repo dans .env
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const mobile = join(__dir, '..');
const root = join(mobile, '../..');

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

const env = { ...loadEnv(join(root, '.env')), ...loadEnv(join(mobile, '.env')) };
const url = env.EXPO_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const serviceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY requis (racine .env ou apps/mobile/.env)');
  console.error('   Dashboard Supabase → Settings → API → service_role');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACCOUNTS = [
  { email: 'visitor-free@test.sib2026.ma', password: 'Demo2026!', type: 'visitor', name: 'Visiteur Free', level: 'free' },
  { email: 'visitor-vip@test.sib2026.ma', password: 'Demo2026!', type: 'visitor', name: 'Visiteur VIP', level: 'premium', status: 'active' },
  { email: 'exhibitor-9m@test.sib2026.ma', password: 'Demo2026!', type: 'exhibitor', name: 'Exposant Demo' },
  { email: 'partner-museum@test.sib2026.ma', password: 'Demo2026!', type: 'partner', name: 'Partenaire Demo' },
  { email: 'admin@sib.com', password: 'Demo2026!', type: 'admin', name: 'Admin SIB' },
  { email: 'service-clientele@sib.com', password: 'Service2026!', type: 'security', name: 'Sécurité SIB' },
];

async function upsertUser(acc) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === acc.email.toLowerCase());

  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  + auth ${acc.email}`);
  } else {
    await admin.auth.admin.updateUserById(userId, { password: acc.password });
    console.log(`  ~ auth ${acc.email}`);
  }

  const row = {
    id: userId,
    email: acc.email.toLowerCase(),
    name: acc.name,
    type: acc.type,
    status: acc.status ?? 'active',
    visitor_level: acc.level ?? null,
  };

  const { error: upErr } = await admin.from('users').upsert([row], { onConflict: 'id' });
  if (upErr) console.warn(`  ⚠ users ${acc.email}:`, upErr.message);
  else console.log(`  ✓ users ${acc.email} (${acc.type})`);
}

console.log('Création comptes démo...\n');
for (const acc of ACCOUNTS) {
  try {
    await upsertUser(acc);
  } catch (e) {
    console.error(`  ✗ ${acc.email}:`, e.message);
  }
}
console.log('\nTerminé. Test: npm run checklist\n');
