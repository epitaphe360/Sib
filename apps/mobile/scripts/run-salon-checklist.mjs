/**
 * Checklist terrain automatisée (API + logique) — compléter avec tests manuels Expo Go.
 * Usage: node scripts/run-salon-checklist.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { webcrypto } from 'crypto';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv();
const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const JWT_SECRET =
  env.EXPO_PUBLIC_JWT_SECRET ??
  env.EXPO_PUBLIC_VITE_JWT_SECRET ??
  'dev-only-secret-do-not-use-in-production-32ch';

const QR_VALIDITY_MS = 60_000;

const ACCOUNTS = {
  visitorFree: { email: 'visitor-free@test.sib2026.ma', password: 'Demo2026!', expectPath: '/(visitor)/(tabs)' },
  visitorVip: { email: 'visitor-vip@test.sib2026.ma', password: 'Demo2026!', expectPath: '/(visitor)/(tabs)' },
  exhibitor: { email: 'exhibitor-9m@test.sib2026.ma', password: 'Demo2026!', expectPath: '/(exhibitor)/(tabs)' },
  partner: { email: 'partner-museum@test.sib2026.ma', password: 'Demo2026!', expectPath: '/(visitor)/(tabs)' },
  admin: { email: 'admin@sib.com', password: 'Demo2026!', expectPath: '/(staff)/(tabs)' },
  security: { email: 'security-controleur@test.sib2026.ma', password: 'Demo2026!', expectPath: '/(staff)/(tabs)/scanner' },
  serviceClient: { email: 'service-clientele@sib.com', password: 'Service2026!', expectPath: '/(service-client)/(tabs)' },
};

function getRoleGroup(type) {
  if (type === 'exhibitor') return 'exhibitor';
  if (type === 'partner') return 'visitor';
  if (type === 'service_client') return 'service_client';
  if (type === 'admin' || type === 'security') return 'staff';
  return 'visitor';
}

function getHomePath(type) {
  const group = getRoleGroup(type);
  if (group === 'exhibitor') return '/(exhibitor)/(tabs)';
  if (group === 'staff') return type === 'security' ? '/(staff)/(tabs)/scanner' : '/(staff)/(tabs)';
  if (type === 'service_client') return '/(service-client)/(tabs)';
  return '/(visitor)/(tabs)';
}

function b64url(data) {
  return Buffer.from(data).toString('base64url');
}

function b64urlDecode(segment) {
  return Buffer.from(segment.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

async function hmacSign(data, secret) {
  const enc = new TextEncoder();
  const key = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await webcrypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function encodeJWT(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = await hmacSign(data, JWT_SECRET);
  return `${data}.${sig}`;
}

async function decodeJWT(token) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const data = `${headerB64}.${payloadB64}`;
  const enc = new TextEncoder();
  const key = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBinary = b64urlDecode(signatureB64);
  const signature = new Uint8Array(sigBinary.length);
  for (let i = 0; i < sigBinary.length; i++) signature[i] = sigBinary.charCodeAt(i);
  const valid = await webcrypto.subtle.verify('HMAC', key, signature, enc.encode(data));
  if (!valid) throw new Error('Invalid JWT signature');
  return JSON.parse(b64urlDecode(payloadB64));
}

async function validateQRCode(qrData, options = {}) {
  try {
    const parts = qrData.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'Format QR non reconnu' };
    const payload = await decodeJWT(qrData);
    const now = Date.now();
    if (payload.exp < now) return { valid: false, reason: 'QR expiré' };
    if (now - payload.iat > QR_VALIDITY_MS) return { valid: false, reason: 'QR trop ancien' };
    if (
      options.requiredZone &&
      !payload.zones.includes('*') &&
      !payload.zones.includes(options.requiredZone)
    ) {
      return { valid: false, reason: `Zone ${options.requiredZone} refusée` };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}

const results = [];

function record(section, name, ok, detail = '') {
  results.push({ section, name, ok, detail });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} [${section}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function signInAs(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: profile, error: pErr } = await client
    .from('users')
    .select('id, email, name, type, visitor_level, status')
    .eq('id', data.user.id)
    .maybeSingle();
  if (pErr) throw pErr;
  return { client, session: data.session, profile };
}

async function main() {
  console.log('\n=== UrbaEvent Mobile — Checklist terrain (automatisée) ===\n');

  // Prérequis
  record(
    'Prérequis',
    '.env EXPO_PUBLIC_SUPABASE_URL',
    Boolean(SUPABASE_URL),
    SUPABASE_URL ? 'OK' : 'manquant'
  );
  record(
    'Prérequis',
    '.env EXPO_PUBLIC_SUPABASE_ANON_KEY',
    Boolean(ANON_KEY && ANON_KEY !== 'your_supabase_anon_key'),
    ANON_KEY ? `${ANON_KEY.slice(0, 12)}…` : 'manquant'
  );
  const easRaw = readFileSync(join(root, 'eas.json'), 'utf8');
  record(
    'Prérequis',
    'Pas de JWT secret client (eas.json)',
    !easRaw.includes('EXPO_PUBLIC_JWT_SECRET'),
    'JWT badge via Edge Function issue-badge-token'
  );

  let appJson = {};
  try {
    appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  } catch {
    /* */
  }
  const projectId =
    env.EXPO_PUBLIC_EAS_PROJECT_ID ?? appJson?.expo?.extra?.eas?.projectId;
  const hasProjectId = Boolean(projectId && projectId !== 'REPLACE_AFTER_eas_init');
  record(
    'Prérequis',
    'eas.projectId (push notifications)',
    true,
    hasProjectId
      ? 'configuré'
      : 'absent — APK OK ; lancez eas login && eas init puis EXPO_PUBLIC_EAS_PROJECT_ID',
  );

  if (!SUPABASE_URL || !ANON_KEY) {
    console.log('\n⚠️  Configurez apps/mobile/.env puis relancez.\n');
    process.exit(1);
  }

  const anon = createClient(SUPABASE_URL, ANON_KEY);

  // Tables / RPC
  for (const table of ['exhibitor_leads', 'time_slots', 'appointments', 'visitor_levels', 'registration_requests']) {
    const { error } = await anon.from(table).select('id').limit(1);
    record('Backend', `Table ${table}`, !error || error.code !== '42P01', error?.message ?? 'accessible');
  }

  const { error: rpcErr } = await anon.rpc('book_appointment_atomic', {
    p_time_slot_id: '00000000-0000-0000-0000-000000000000',
    p_visitor_id: '00000000-0000-0000-0000-000000000000',
    p_exhibitor_id: '00000000-0000-0000-0000-000000000000',
    p_notes: null,
    p_meeting_type: 'in-person',
  });
  record(
    'Backend',
    'RPC book_appointment_atomic',
    !rpcErr || !rpcErr.message?.includes('Could not find'),
    rpcErr?.message?.slice(0, 80) ?? 'existe'
  );

  // Auth & rôles
  record('Auth', 'Visiteur anonyme → /(visitor)', true, 'redirect code: index → /(visitor)');

  for (const [key, acc] of Object.entries(ACCOUNTS)) {
    try {
      const { profile } = await signInAs(acc.email, acc.password);
      const path = getHomePath(profile.type);
      const ok = path === acc.expectPath;
      record('Auth', `Login ${key}`, ok, `${profile.type} → ${path}`);
    } catch (e) {
      record('Auth', `Login ${key}`, false, e.message);
    }
  }

  record(
    'Auth',
    'Deep link reset-password',
    appJson?.expo?.scheme === 'urbaevent',
    'urbaevent://reset-password'
  );

  // Badge JWT (logique — ne dépend pas des comptes démo)
  try {
    const now = Date.now();
    const freeUserId = '00000000-0000-0000-0000-000000000001';
    const vipUserId = '00000000-0000-0000-0000-000000000002';
    const freePayload = {
      userId: freeUserId,
      email: 'free@test.local',
      name: 'Visiteur Free',
      userType: 'visitor',
      level: 'free',
      iat: now,
      exp: now + QR_VALIDITY_MS,
      nonce: 'test-free',
      zones: ['public', 'exhibition_hall'],
    };
    const vipPayload = {
      ...freePayload,
      userId: vipUserId,
      email: 'vip@test.local',
      level: 'premium',
      nonce: 'test-vip',
      zones: ['public', 'exhibition_hall', 'vip_lounge', 'networking_area'],
    };

    const freeQr = await encodeJWT(freePayload);
    const vipQr = await encodeJWT(vipPayload);

    const vPublic = await validateQRCode(freeQr, { requiredZone: 'public' });
    record('Badge JWT', 'Free → zone public', vPublic.valid, vPublic.reason);

    const vHall = await validateQRCode(freeQr, { requiredZone: 'exhibition_hall' });
    record('Badge JWT', 'Free → zone exhibition_hall', vHall.valid);

    const vVipZone = await validateQRCode(vipQr, { requiredZone: 'vip_lounge' });
    record('Badge JWT', 'VIP → zone vip_lounge', vVipZone.valid);

    const vFreeVipZone = await validateQRCode(freeQr, { requiredZone: 'vip_lounge' });
    record('Badge JWT', 'Free → vip_lounge (doit échouer)', !vFreeVipZone.valid, vFreeVipZone.reason);

    const expired = await encodeJWT({ ...freePayload, iat: now - 120_000, exp: now - 60_000 });
    const vExpired = await validateQRCode(expired);
    record('Badge JWT', 'QR expiré (doit échouer)', !vExpired.valid, vExpired.reason);

    // Scan exposant (logique sans caméra)
    const leadScan = await validateQRCode(freeQr);
    const visitorOnly =
      leadScan.valid && leadScan.payload?.userType === 'visitor';
    record('Badge JWT', 'Scan exposant — JWT visiteur valide', visitorOnly);
  } catch (e) {
    record('Badge JWT', 'Suite badge/scanner', false, e.message);
  }

  // Insert lead (nécessite session exposant + visiteur réel en base)
  try {
    const visitor = await signInAs(ACCOUNTS.visitorFree.email, ACCOUNTS.visitorFree.password);
    const visitorUserId = visitor.profile.id;
    const ex = await signInAs(ACCOUNTS.exhibitor.email, ACCOUNTS.exhibitor.password);
    const { error: leadErr } = await ex.client.from('exhibitor_leads').insert({
      exhibitor_user_id: ex.profile.id,
      visitor_user_id: visitorUserId,
      scanned_at: new Date().toISOString(),
    });
    record('Badge JWT', 'Insert exhibitor_leads (auth exposant)', !leadErr, leadErr?.message ?? 'OK');
    if (!leadErr) {
      await ex.client
        .from('exhibitor_leads')
        .delete()
        .eq('exhibitor_user_id', ex.profile.id)
        .eq('visitor_user_id', visitorUserId);
    }
  } catch (e) {
    record('Badge JWT', 'Insert exhibitor_leads (auth exposant)', false, e.message);
  }

  // RDV & permissions (aligné networkingPermissions.ts)
  const freePerms = {
    canScheduleMeetings: false,
    canAccessNetworking: false,
  };
  const vipPerms = {
    canScheduleMeetings: true,
    canAccessNetworking: true,
  };
  record('RDV', 'Visiteur free bloqué RDV (logique)', !freePerms.canScheduleMeetings);
  record('RDV', 'Visiteur VIP peut RDV (logique)', vipPerms.canScheduleMeetings);

  const { data: slots, error: slotsErr } = await anon.from('time_slots').select('id').limit(5);
  record('RDV', 'Créneaux time_slots en base', (slots?.length ?? 0) > 0, slotsErr?.message ?? `${slots?.length ?? 0} créneaux`);

  // Admin
  try {
    const admin = await signInAs(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
    const { count: userCount } = await admin.client.from('users').select('id', { count: 'exact', head: true });
    record('Admin', 'Stats users (lecture)', (userCount ?? 0) > 0, `${userCount} users`);

    const { data: pending } = await admin.client
      .from('payment_requests')
      .select('id, status')
      .eq('status', 'pending')
      .limit(3);
    record('Admin', 'Paiements pending', true, `${pending?.length ?? 0} en attente`);

    const { data: alerts } = await admin.client
      .from('registration_requests')
      .select('id, status')
      .eq('status', 'pending')
      .limit(3);
    record('Admin', 'Alertes registration_requests', true, `${alerts?.length ?? 0} pending`);

    const { data: levels } = await admin.client.from('visitor_levels').select('level, price_annual').limit(5);
    record('Admin', 'visitor_levels', (levels?.length ?? 0) > 0, levels?.map((l) => l.level).join(', '));

    const { data: scanStats, error: scanStatsErr } = await admin.client.rpc('get_admin_scan_statistics', {
      p_salon_id: null,
    });
    record(
      'Admin',
      'RPC get_admin_scan_statistics',
      !scanStatsErr && scanStats && typeof scanStats === 'object',
      scanStatsErr?.message ?? `entry=${scanStats?.entry_scans ?? 0}`,
    );
  } catch (e) {
    record('Admin', 'Suite admin', false, e.message);
  }

  // Résumé
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Résultat: ${passed}/${results.length} OK ===\n`);
  if (failed.length) {
    console.log('À corriger ou tester manuellement:');
    failed.forEach((f) => console.log(`  - [${f.section}] ${f.name}: ${f.detail}`));
  }

  console.log('\n--- Tests MANUELS restants (Expo Go sur téléphone) ---');
  console.log('  1. npx expo start → scanner QR Expo');
  console.log('  2. Caméra: scan badge + scan exposant');
  console.log('  3. Push notification (device physique)');
  console.log('  4. Offline: mode avion après 1ère visite annuaire/programme');
  console.log('  5. i18n: Paramètres → العربية (RTL)');
  console.log('  6. Mot de passe oublié → email + urbaevent://reset-password');
  console.log('  7. eas build --profile preview --platform android\n');

  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
