#!/usr/bin/env node
/**
 * Audit RLS + schéma — comptes démo mobile (anon key, pas service role)
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: join(root, '.env') });

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const ACCOUNTS = [
  ['visiteur@sib.com', 'Visit123!', 'visitor'],
  ['exposant@sib.com', 'Expo123!', 'exhibitor'],
  ['partenaire@sib.com', 'Partner123!', 'partner'],
  ['admin.sib@sib.com', 'Admin123!', 'admin'],
  ['securite@sib.com', 'Secu123!', 'security'],
  ['service-clientele@sib.com', 'Service2026!', 'service_client'],
];

async function testQuery(sb, label, fn) {
  try {
    const result = await fn();
    if (result?.error) {
      return { label, ok: false, detail: `${result.error.code ?? ''} ${result.error.message}`.trim() };
    }
    return { label, ok: true, detail: result.detail ?? 'OK' };
  } catch (e) {
    return { label, ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

async function runAccount([email, password, expectedType]) {
  const sb = createClient(url, anon);
  await sb.auth.signOut();
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({ email, password });
  if (authErr) return { email, auth: false, error: authErr.message, tests: [] };

  const uid = auth.user?.id;
  const tests = [];

  tests.push(
    await testQuery(sb, 'users (own)', async () => {
      const r = await sb.from('users').select('id,type,status').eq('id', uid).maybeSingle();
      if (r.error) return { error: r.error };
      return { detail: r.data ? `${r.data.type}/${r.data.status}` : 'NULL' };
    })
  );

  if (tests[tests.length - 1].ok === false && tests[tests.length - 1].detail.includes('42P17')) {
    tests.push(
      await testQuery(sb, 'get_my_profile RPC', async () => {
        const r = await sb.rpc('get_my_profile');
        if (r.error) return { error: r.error };
        return { detail: r.data?.type ?? 'NULL' };
      })
    );
  }

  tests.push(
    await testQuery(sb, 'user_badges (own)', async () => {
      const r = await sb.from('user_badges').select('id').eq('user_id', uid).limit(1);
      if (r.error) return { error: r.error };
      return { detail: `${r.data?.length ?? 0} row(s)` };
    })
  );

  tests.push(
    await testQuery(sb, 'events', async () => {
      const r = await sb.from('events').select('id,start_date').limit(3);
      if (r.error) return { error: r.error };
      return { detail: `${r.data?.length ?? 0} row(s)` };
    })
  );

  tests.push(
    await testQuery(sb, 'events order start_date', async () => {
      const r = await sb.from('events').select('id').order('start_date', { ascending: true }).limit(1);
      if (r.error) return { error: r.error };
      return { detail: r.data?.[0]?.id ? 'OK' : 'empty' };
    })
  );

  tests.push(
    await testQuery(sb, 'events order event_date (BUG)', async () => {
      const r = await sb.from('events').select('id').order('event_date', { ascending: true }).limit(1);
      if (r.error) return { error: r.error };
      return { detail: 'column exists' };
    })
  );

  tests.push(
    await testQuery(sb, 'news_articles', async () => {
      const r = await sb.from('news_articles').select('id').eq('is_published', true).limit(3);
      if (r.error) {
        const r2 = await sb.from('news_articles').select('id').eq('published', true).limit(3);
        if (r2.error) return { error: r2.error };
        return { detail: `published col: ${r2.data?.length ?? 0}` };
      }
      return { detail: `is_published: ${r.data?.length ?? 0}` };
    })
  );

  tests.push(
    await testQuery(sb, 'exhibitors public', async () => {
      const r = await sb.from('exhibitors').select('id').eq('verified', true).limit(5);
      if (r.error) return { error: r.error };
      return { detail: `${r.data?.length ?? 0} verified` };
    })
  );

  tests.push(
    await testQuery(sb, 'salons', async () => {
      const r = await sb.from('salons').select('id,slug,floor_plan_url').limit(5);
      if (r.error) return { error: r.error };
      return { detail: `${r.data?.length ?? 0} salon(s)` };
    })
  );

  if (expectedType === 'exhibitor') {
    tests.push(
      await testQuery(sb, 'exhibitors (own)', async () => {
        const r = await sb.from('exhibitors').select('id,is_published,published').eq('user_id', uid).maybeSingle();
        if (r.error) return { error: r.error };
        return { detail: r.data?.id ?? 'NULL' };
      })
    );
    tests.push(
      await testQuery(sb, 'mini_sites', async () => {
        const ex = await sb.from('exhibitors').select('id').eq('user_id', uid).maybeSingle();
        if (!ex.data?.id) return { detail: 'no exhibitor' };
        const r = await sb.from('mini_sites').select('id,published,is_published').eq('exhibitor_id', ex.data.id).maybeSingle();
        if (r.error) return { error: r.error };
        return { detail: r.data ? 'OK' : 'none' };
      })
    );
  }

  if (['admin', 'security', 'service_client'].includes(expectedType)) {
    tests.push(
      await testQuery(sb, 'users (all staff)', async () => {
        const r = await sb.from('users').select('id', { count: 'exact', head: true });
        if (r.error) return { error: r.error };
        return { detail: `count=${r.count ?? 0}` };
      })
    );
    tests.push(
      await testQuery(sb, 'user_badges (others)', async () => {
        const r = await sb.from('user_badges').select('id').neq('user_id', uid).limit(3);
        if (r.error) return { error: r.error };
        return { detail: `${r.data?.length ?? 0} row(s)` };
      })
    );
  }

  if (expectedType === 'admin') {
    tests.push(
      await testQuery(sb, 'payment_requests pending', async () => {
        const r = await sb.from('payment_requests').select('id').eq('status', 'pending').limit(5);
        if (r.error) return { error: r.error };
        return { detail: `${r.data?.length ?? 0} pending` };
      })
    );
  }

  tests.push(
    await testQuery(sb, 'speed_networking_sessions', async () => {
      const r = await sb.from('speed_networking_sessions').select('id,participants').limit(2);
      if (r.error) return { error: r.error };
      return { detail: `${r.data?.length ?? 0} session(s)` };
    })
  );

  tests.push(
    await testQuery(sb, 'speed_networking_participants table', async () => {
      const r = await sb.from('speed_networking_participants').select('id').limit(1);
      if (r.error) return { error: r.error };
      return { detail: 'exists' };
    })
  );

  tests.push(
    await testQuery(sb, 'badge_replacements table', async () => {
      const r = await sb.from('badge_replacements').select('id').limit(1);
      if (r.error) return { error: r.error };
      return { detail: 'exists' };
    })
  );

  const profileType = tests.find((t) => t.label.startsWith('users'))?.detail?.split('/')?.[0];
  return { email, auth: true, type: profileType, tests };
}

async function main() {
  console.log('=== AUDIT DEMO RLS ===\n');
  const results = [];
  for (const acc of ACCOUNTS) {
    const r = await runAccount(acc);
    results.push(r);
    const fails = r.tests?.filter((t) => !t.ok) ?? [];
    console.log(`\n## ${r.email} ${r.auth ? '✓' : '✗ AUTH: ' + r.error}`);
    if (r.tests) {
      for (const t of r.tests) {
        console.log(`  ${t.ok ? '✓' : '✗'} ${t.label}: ${t.detail}`);
      }
    }
    if (fails.length) console.log(`  => ${fails.length} échec(s)`);
  }

  const totalFails = results.reduce((n, r) => n + (r.tests?.filter((t) => !t.ok).length ?? 0), 0);
  console.log(`\n=== TOTAL ÉCHECS: ${totalFails} ===`);
}

main().catch(console.error);
