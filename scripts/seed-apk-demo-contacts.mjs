/**
 * Crée 3 contacts démo + connexions pour visiteur@sib.com (APK Mes scans / fiche contact).
 * Prérequis : VITE_SUPABASE_SERVICE_ROLE_KEY dans .env racine ou apps/mobile/.env
 *
 * Usage: node scripts/seed-apk-demo-contacts.mjs
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

const env = { ...loadEnv(join(root, '.env')), ...loadEnv(join(root, 'apps/mobile/.env')) };
const url = env.EXPO_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const serviceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL requis');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const VISITOR_EMAILS = ['visiteur@sib.com', 'demo.visitor@sib.com', 'visitor-free@test.sib2026.ma'];
const DEMO_PASSWORD = 'Demo2026!';

const EXTRA_CONTACTS = [
  {
    email: 'demo.contact1@sib.com',
    name: 'Fatima El Amrani',
    type: 'visitor',
    level: 'premium',
    profile: { company: 'Atlas Construction', job_title: 'Chef de projet', phone: '+212612345678' },
    connectionStatus: 'accepted',
    lead: false,
  },
  {
    email: 'demo.contact2@sib.com',
    name: 'Karim Tazi',
    type: 'exhibitor',
    profile: { company: 'EcoBati Solutions', job_title: 'CEO', phone: '+212698765432' },
    exhibitor: {
      company_name: 'EcoBati Solutions',
      sector: 'Matériaux écologiques',
      stand_number: 'B-07',
      hall_number: 'Hall 2',
    },
    connectionStatus: 'accepted',
    lead: true,
  },
  {
    email: 'demo.contact3@sib.com',
    name: 'Sofia Laurent',
    type: 'partner',
    profile: { company: 'MedBuild Partners', job_title: 'Directrice développement', phone: '+212611223344' },
    connectionStatus: 'pending',
    lead: false,
  },
];

async function findAuthUser(email) {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function ensureAuthUser(email, name, type) {
  let user = await findAuthUser(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name, type },
    });
    if (error) throw error;
    user = data.user;
    console.log(`  + auth ${email}`);
  } else {
    console.log(`  ~ auth ${email}`);
  }
  return user;
}

async function upsertPublicUser(userId, email, name, type, level, profile) {
  const row = {
    id: userId,
    email: email.toLowerCase(),
    name,
    type,
    status: 'active',
    visitor_level: level ?? null,
    profile: profile ?? {},
  };
  const { error } = await admin.from('users').upsert([row], { onConflict: 'id' });
  if (error) throw error;
}

async function main() {
  console.log('Seed contacts APK…\n');

  let visitorId = null;
  for (const email of VISITOR_EMAILS) {
    const u = await findAuthUser(email);
    if (u) {
      visitorId = u.id;
      console.log(`Visiteur cible: ${email} (${visitorId})`);
      break;
    }
  }
  if (!visitorId) {
    console.error('❌ Aucun visiteur démo trouvé. Créez visiteur@sib.com d’abord.');
    process.exit(1);
  }

  const salonId = 'sib';
  const salonName = 'SIB 2026 · El Jadida';

  for (const c of EXTRA_CONTACTS) {
    console.log(`\nContact: ${c.email}`);
    const authUser = await ensureAuthUser(c.email, c.name, c.type);
    await upsertPublicUser(authUser.id, c.email, c.name, c.type, c.level, c.profile);

    if (c.exhibitor) {
      const { data: exRow } = await admin
        .from('exhibitors')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (exRow?.id) {
        const { error } = await admin.from('exhibitors').update({ ...c.exhibitor, is_published: true, verified: true }).eq('id', exRow.id);
        if (error) console.warn('  ⚠ exhibitors update:', error.message);
        else console.log('  ✓ exhibitor row (updated)');
      } else {
        const { error } = await admin.from('exhibitors').insert({
          user_id: authUser.id,
          company_name: c.exhibitor.company_name,
          category: 'materials',
          sector: c.exhibitor.sector,
          description: 'Exposant démo SIB 2026',
          stand_number: c.exhibitor.stand_number,
          hall_number: c.exhibitor.hall_number,
          is_published: true,
          verified: true,
        });
        if (error) console.warn('  ⚠ exhibitors insert:', error.message);
        else console.log('  ✓ exhibitor row (created)');
      }
    }

    const { error: connErr } = await admin.from('connections').upsert(
      [{
        requester_id: visitorId,
        addressee_id: authUser.id,
        status: c.connectionStatus,
        message: 'Contact démo SIB 2026 — APK',
        salon_id: salonId,
        salon_name: salonName,
      }],
      { onConflict: 'requester_id,addressee_id' },
    );
    if (connErr) console.warn('  ⚠ connection:', connErr.message);
    else console.log(`  ✓ connection (${c.connectionStatus})`);

    if (c.lead) {
      const { data: existing } = await admin
        .from('exhibitor_leads')
        .select('id')
        .eq('exhibitor_user_id', authUser.id)
        .eq('visitor_user_id', visitorId)
        .maybeSingle();
      if (!existing) {
        const { error: leadErr } = await admin.from('exhibitor_leads').insert({
          exhibitor_user_id: authUser.id,
          visitor_user_id: visitorId,
          salon_id: salonId,
          salon_name: salonName,
        });
        if (leadErr) console.warn('  ⚠ lead:', leadErr.message);
        else console.log('  ✓ exhibitor_lead');
      }
    }
  }

  // exposant@sib.com + partenaire@sib.com
  for (const [email, status] of [['exposant@sib.com', 'accepted'], ['partenaire@sib.com', 'pending']]) {
    const u = await findAuthUser(email);
    if (!u) continue;
    await admin.from('connections').upsert(
      [{
        requester_id: visitorId,
        addressee_id: u.id,
        status,
        message: 'Networking SIB 2026',
        salon_id: salonId,
        salon_name: salonName,
      }],
      { onConflict: 'requester_id,addressee_id' },
    );
    console.log(`\n✓ Lien ${email} → ${status}`);
  }

  console.log('\n✅ Terminé. Appliquez aussi la migration 20260629000002 si pas encore faite.');
  console.log('   Puis reconnectez visiteur@sib.com dans l’APK → Mes scans / Réseau.');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
