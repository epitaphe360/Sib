/**
 * Test de charge — génération QR dynamique (Edge Function issue-badge-token)
 *
 * Simule des visiteurs avec l'app ouverte sur l'écran badge (refresh ~30s).
 *
 * Usage:
 *   npm run load:qr-token
 *   LOAD_QR_CONCURRENCY=100 LOAD_QR_ITERATIONS=6 npm run load:qr-token
 *
 * Variables:
 *   LOAD_QR_CONCURRENCY   — utilisateurs simultanés (défaut 50)
 *   LOAD_QR_ITERATIONS    — refresh par utilisateur (défaut 4)
 *   LOAD_QR_MAX_FAIL_RATE — % échecs max (défaut 2)
 *   LOAD_QR_MAX_P95_MS    — p95 max ms (défaut 1500)
 */
import { performance } from 'node:perf_hooks';
import {
  createSupabaseClients,
  DEMO_ACCOUNTS,
  signIn,
  invokeIssueBadgeToken,
  summarizeLatencies,
  printSummary,
  checkThresholds,
} from './load/shared.mjs';

const concurrency = Number(process.env.LOAD_QR_CONCURRENCY || 50);
const iterations = Number(process.env.LOAD_QR_ITERATIONS || 4);
const maxFailRate = Number(process.env.LOAD_QR_MAX_FAIL_RATE || 2);
const maxP95 = Number(process.env.LOAD_QR_MAX_P95_MS || 1500);

async function buildSessionPool(anon, count) {
  const sessions = [];
  for (const acc of DEMO_ACCOUNTS) {
    if (sessions.length >= count) break;
    try {
      const session = await signIn(anon, acc.email, acc.password);
      sessions.push(session.access_token);
    } catch {
      /* skip */
    }
  }
  while (sessions.length < count && sessions.length > 0) {
    sessions.push(sessions[sessions.length % sessions.length]);
  }
  return sessions;
}

async function main() {
  const { url, anonKey, anon } = createSupabaseClients();
  const sessions = await buildSessionPool(anon, concurrency);

  if (!sessions.length) {
    console.error('Impossible de se connecter avec les comptes démo. Vérifiez les credentials.');
    process.exit(2);
  }

  const effectiveConcurrency = Math.min(concurrency, sessions.length);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  LOAD TEST — QR dynamique (issue-badge-token)              ║
║  Cible: ${url.slice(0, 48).padEnd(48)} ║
║  Utilisateurs simultanés: ${String(effectiveConcurrency).padEnd(28)} ║
║  Refresh / utilisateur:   ${String(iterations).padEnd(28)} ║
║  Sessions auth:           ${String(sessions.length).padEnd(28)} ║
╚════════════════════════════════════════════════════════════╝
  `);

  const results = [];

  async function userWorker(workerId) {
    const token = sessions[(workerId - 1) % sessions.length];
    for (let i = 0; i < iterations; i += 1) {
      const r = await invokeIssueBadgeToken(url, anonKey, token);
      results.push({ ...r, workerId, iteration: i + 1 });
    }
  }

  const startAll = performance.now();
  await Promise.all(
    Array.from({ length: effectiveConcurrency }, (_, i) => userWorker(i + 1))
  );
  const totalMs = performance.now() - startAll;

  const latencies = results.map((r) => r.ms);
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const failRate = results.length ? Number(((fail / results.length) * 100).toFixed(2)) : 0;

  const summary = {
    scenario: 'qr_token_rotation',
    concurrency: effectiveConcurrency,
    iterations,
    totalRequests: results.length,
    ok,
    fail,
    failRate,
    durationSec: Number((totalMs / 1000).toFixed(2)),
    rps: Number((results.length / (totalMs / 1000)).toFixed(2)),
    latency: summarizeLatencies(latencies),
    thresholds: { maxFailRate, maxP95 },
    sampleErrors: [...new Set(results.filter((r) => !r.ok).map((r) => r.error))].slice(0, 5),
  };

  printSummary('QR TOKEN LOAD TEST', summary);

  const passed = checkThresholds(
    { failRate: summary.failRate, latency: summary.latency },
    { maxFailRate, maxP95 }
  );
  process.exit(passed ? 0 : 1);
}

main().catch((e) => {
  console.error('LOAD QR TOKEN ERROR', e);
  process.exit(1);
});
