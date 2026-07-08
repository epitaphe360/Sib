/**
 * Utilitaires partagés — tests de charge SIB / UrbaEvent
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..', '..');

function parseEnvFile(path) {
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

export function loadConfig() {
  const files = [
    join(root, '.env'),
    join(root, 'apps/mobile/.env'),
  ];
  const merged = {};
  for (const f of files) Object.assign(merged, parseEnvFile(f));

  const url =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    merged.VITE_SUPABASE_URL ??
    merged.EXPO_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    merged.VITE_SUPABASE_ANON_KEY ??
    merged.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
    merged.SUPABASE_SERVICE_ROLE_KEY ??
    merged.VITE_SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey, serviceKey, root };
}

export function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function summarizeLatencies(latencies) {
  const total = latencies.length;
  const sum = latencies.reduce((a, b) => a + b, 0);
  return {
    count: total,
    avg: Number((sum / (total || 1)).toFixed(2)),
    p50: Number(percentile(latencies, 50).toFixed(2)),
    p95: Number(percentile(latencies, 95).toFixed(2)),
    p99: Number(percentile(latencies, 99).toFixed(2)),
    max: Number(latencies.reduce((m, v) => v > m ? v : m, 0).toFixed(2)),
  };
}

export function printSummary(title, summary) {
  console.log(`\n═══ ${title} ═══`);
  console.log(JSON.stringify(summary, null, 2));
}

export function checkThresholds(summary, { maxFailRate = 2, maxP95 = 1200 } = {}) {
  const ok = summary.failRate <= maxFailRate && summary.latency.p95 <= maxP95;
  if (!ok) {
    console.error(
      `FAILED: failRate ${summary.failRate}% (max ${maxFailRate}%) · p95 ${summary.latency.p95}ms (max ${maxP95}ms)`
    );
    return false;
  }
  console.log('PASSED');
  return true;
}

export function createSupabaseClients() {
  const { url, anonKey, serviceKey } = loadConfig();
  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY requis (.env racine ou apps/mobile/.env)');
  }
  const anon = createClient(url, anonKey);
  const admin = serviceKey ? createClient(url, serviceKey) : null;
  return { url, anonKey, serviceKey, anon, admin };
}

/** Comptes staff pour scans (access_logs) */
export const STAFF_ACCOUNTS = [
  { email: 'securite@sib.com', password: 'Secu123!' },
  { email: 'service-clientele@sib.com', password: 'Service2026!' },
  { email: 'admin.sib@sib.com', password: 'Admin123!' },
];

/** Comptes démo pour sessions authentifiées (QR token load) */
export const DEMO_ACCOUNTS = [
  { email: 'visiteur@sib.com', password: 'Visit123!' },
  { email: 'visitor-free@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'visitor-vip@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'exhibitor-9m@test.sib2026.ma', password: 'Demo2026!' },
];

export async function signIn(anon, email, password) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function fetchBadgeCodePool(admin, limit = 200) {
  if (!admin) return [];
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('user_badges')
    .select('badge_code, valid_from, valid_until')
    .eq('status', 'active')
    .gt('valid_until', now)
    .limit(limit);
  if (error) throw error;
  return (data ?? [])
    .filter((r) => !r.valid_from || new Date(r.valid_from) <= new Date())
    .map((r) => r.badge_code)
    .filter(Boolean);
}

export async function fetchBadgeCodeViaLogin(anon) {
  for (const acc of DEMO_ACCOUNTS) {
    try {
      const session = await signIn(anon, acc.email, acc.password);
      const userId = session.user.id;
      const { data } = await anon
        .from('user_badges')
        .select('badge_code')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.badge_code) return { badgeCode: data.badge_code, session };
    } catch {
      /* try next account */
    }
  }
  return null;
}

export async function signInStaff(anon) {
  for (const acc of STAFF_ACCOUNTS) {
    try {
      return await signIn(anon, acc.email, acc.password);
    } catch {
      /* next */
    }
  }
  throw new Error('Aucun compte staff disponible (securite / service-clientele / admin)');
}

export function buildAppQrPayload(badge) {
  return JSON.stringify({
    code: badge.badge_code,
    userId: badge.user_id,
    type: badge.user_type,
    level: badge.access_level,
    name: badge.full_name,
  });
}

export async function fetchAppQrPool(admin, limit = 500) {
  if (!admin) return [];
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('user_badges')
    .select('badge_code, user_id, user_type, access_level, full_name, valid_from, valid_until')
    .eq('status', 'active')
    .gt('valid_until', now)
    .limit(limit);
  if (error) throw error;
  return (data ?? [])
    .filter((r) => !r.valid_from || new Date(r.valid_from) <= new Date())
    .map((r) => ({
      qrPayload: buildAppQrPayload(r),
      badgeCode: r.badge_code,
      userId: r.user_id,
      userName: r.full_name,
      userType: r.user_type,
      userLevel: r.user_type === 'visitor' ? r.access_level : undefined,
    }));
}

export async function fetchSalonContext(admin) {
  if (!admin) return { salonId: null, salonName: 'SIB 2026' };
  const { data } = await admin
    .from('salons')
    .select('id, name, slug')
    .or('slug.eq.sib-2026,slug.eq.sib2026,name.ilike.%SIB%')
    .limit(1)
    .maybeSingle();
  return {
    salonId: data?.id ?? null,
    salonName: data?.name ?? 'SIB 2026',
  };
}

export async function countTable(admin, table, sinceIso) {
  if (!admin) return 0;
  let q = admin.from(table).select('id', { count: 'exact', head: true });
  if (sinceIso) q = q.gte('accessed_at', sinceIso);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

/** Parcours complet app : validation QR JSON + stockage access_logs */
export async function scanQrAppJourney(url, anonKey, staffToken, qrPayload, ctx) {
  const start = performance.now();
  const zone = ctx.zone ?? 'public';

  async function fallbackTwoStep() {
    let vBody = null;
    let success = false;

    const vRes = await fetch(`${url}/rest/v1/rpc/validate_scanned_badge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ p_qr_data: qrPayload }),
    });
    vBody = await vRes.json().catch(() => null);
    success = vRes.ok && vBody?.success === true;

    // Secours prod : scan_badge si validate_scanned_badge pas encore migrée
    if (!success) {
      let code = qrPayload;
      if (qrPayload.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(qrPayload);
          code = parsed.code ?? parsed.badge_code ?? qrPayload;
        } catch { /* keep */ }
      }
      const sRes = await fetch(`${url}/rest/v1/rpc/scan_badge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ p_badge_code: code }),
      });
      const sBody = await sRes.json().catch(() => null);
      if (sRes.ok && sBody?.badge_code) {
        success = true;
        vBody = {
          success: true,
          badge_code: sBody.badge_code,
          user: {
            id: sBody.user_id,
            full_name: sBody.full_name,
            user_type: sBody.user_type,
            user_level: sBody.user_level,
          },
        };
      }
    }

    const user = vBody?.user ?? {};

    const logRes = await fetch(`${url}/rest/v1/access_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${staffToken}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: user.id ?? null,
        user_name: user.full_name ?? vBody?.full_name ?? null,
        user_type: user.user_type ?? vBody?.user_type ?? null,
        user_level: user.user_level ?? vBody?.user_level ?? null,
        zone,
        status: success ? 'granted' : 'denied',
        reason: success ? null : vBody?.error ?? 'Badge invalide',
        scanned_by: ctx.scannedBy,
        scanner_device: ctx.scannerDevice ?? 'load-test-qr-app',
        accessed_at: new Date().toISOString(),
        event: ctx.salonName ?? 'SIB 2026',
      }),
    });

    return {
      ok: success,
      logged: logRes.ok,
      ms: performance.now() - start,
      badgeCode: vBody?.badge_code,
      userName: user.full_name ?? vBody?.full_name,
      error: success
        ? (logRes.ok ? undefined : 'access_logs insert failed')
        : vBody?.error,
    };
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/record_badge_scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        p_qr_data: qrPayload,
        p_zone: zone,
        p_scanned_by: ctx.scannedBy,
        p_scanner_device: ctx.scannerDevice ?? 'load-test-qr-app',
        p_salon_id: ctx.salonId,
        p_salon_name: ctx.salonName,
      }),
    });

    if (res.status === 404) return fallbackTwoStep();
    const body = await res.json().catch(() => null);
    if (body?.code === 'PGRST202') return fallbackTwoStep();

    const success = res.ok && body?.success === true;
    return {
      ok: success,
      logged: body?.logged === true,
      ms: performance.now() - start,
      badgeCode: body?.badge_code,
      userName: body?.user?.full_name,
      error: success ? undefined : body?.error ?? `HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, logged: false, ms: performance.now() - start, error: String(e) };
  }
}

export async function rpcScanBadge(url, anonKey, badgeCode, mode = 'validate') {
  const start = performance.now();
  try {
    if (mode === 'scan_badge') {
      const res = await fetch(`${url}/rest/v1/rpc/scan_badge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ p_badge_code: badgeCode }),
      });
      const elapsed = performance.now() - start;
      const body = await res.json().catch(() => null);
      const success = res.ok && body?.badge_code;
      return {
        ok: success,
        status: res.status,
        ms: elapsed,
        error: success ? undefined : body?.message ?? `HTTP ${res.status}`,
      };
    }

    const res = await fetch(`${url}/rest/v1/rpc/validate_scanned_badge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ p_qr_data: badgeCode }),
    });
    const elapsed = performance.now() - start;
    const body = await res.json().catch(() => null);
    const success = res.ok && body?.success === true;
    return {
      ok: success,
      status: res.status,
      ms: elapsed,
      error: success ? undefined : body?.error ?? body?.message ?? `HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, status: 0, ms: performance.now() - start, error: String(e) };
  }
}

export async function rpcValidateBadge(url, anonKey, badgeCode) {
  return rpcScanBadge(url, anonKey, badgeCode, 'validate');
}

export async function invokeIssueBadgeToken(url, anonKey, accessToken) {
  const start = performance.now();
  try {
    const res = await fetch(`${url}/functions/v1/issue-badge-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });
    const elapsed = performance.now() - start;
    const body = await res.json().catch(() => null);
    const ok = res.ok && body?.qrData;
    return {
      ok,
      status: res.status,
      ms: elapsed,
      error: ok ? undefined : body?.error ?? `HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, status: 0, ms: performance.now() - start, error: String(e) };
  }
}

export async function restSelect(url, anonKey, table, query = 'select=id&limit=50') {
  const start = performance.now();
  try {
    const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const elapsed = performance.now() - start;
    return { ok: res.ok, status: res.status, ms: elapsed };
  } catch (e) {
    return { ok: false, status: 0, ms: performance.now() - start, error: String(e) };
  }
}
