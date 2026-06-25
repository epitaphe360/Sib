/**
 * Test de charge — scans badge à l'entrée (RPC validate_scanned_badge)
 *
 * Simule plusieurs portiques scannant en parallèle (badges imprimés statiques).
 *
 * Usage:
 *   npm run load:badge-scan
 *   LOAD_SCAN_CONCURRENCY=50 LOAD_SCAN_ITERATIONS=20 npm run load:badge-scan
 *
 * Variables:
 *   LOAD_SCAN_CONCURRENCY  — scanners simultanés (défaut 30)
 *   LOAD_SCAN_ITERATIONS   — scans par scanner (défaut 10)
 *   LOAD_SCAN_MAX_FAIL_RATE — % échecs max (défaut 2)
 *   LOAD_SCAN_RPC          — validate (app) ou scan_badge (legacy)
 */
import { performance } from 'node:perf_hooks';
import {
  createSupabaseClients,
  fetchBadgeCodePool,
  fetchBadgeCodeViaLogin,
  rpcScanBadge,
  summarizeLatencies,
  printSummary,
  checkThresholds,
} from './load/shared.mjs';

const concurrency = Number(process.env.LOAD_SCAN_CONCURRENCY || 30);
const iterations = Number(process.env.LOAD_SCAN_ITERATIONS || 10);
const maxFailRate = Number(process.env.LOAD_SCAN_MAX_FAIL_RATE || 2);
const maxP95 = Number(process.env.LOAD_SCAN_MAX_P95_MS || 800);
const scanMode = process.env.LOAD_SCAN_RPC || 'validate';

async function main() {
  const { url, anonKey, admin, anon } = createSupabaseClients();

  let badgeCodes = await fetchBadgeCodePool(admin, 500);
  if (!badgeCodes.length) {
    console.warn('⚠️  Pas de SERVICE_ROLE_KEY — tentative via compte démo…');
    const loginResult = await fetchBadgeCodeViaLogin(anon);
    if (loginResult?.badgeCode) badgeCodes = [loginResult.badgeCode];
  }

  if (!badgeCodes.length) {
    console.error('Aucun badge_code disponible. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env');
    process.exit(2);
  }

  const rpcMode = scanMode === 'scan_badge' ? 'scan_badge' : 'validate';
  const preflight = await rpcScanBadge(url, anonKey, badgeCodes[0], rpcMode);
  if (!preflight.ok) {
    console.error(`❌ Preflight échoué (${rpcMode}): ${preflight.error}`);
    if (rpcMode === 'validate') {
      console.error('→ Appliquez supabase/migrations/20260625000001_fix_validate_scanned_badge.sql');
      console.error('→ Ou temporaire: LOAD_SCAN_RPC=scan_badge npm run load:badge-scan');
    }
    process.exit(2);
  }

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  LOAD TEST — Scans badge (entrée salon)                    ║
║  Cible: ${url.slice(0, 48).padEnd(48)} ║
║  Scanners simultanés: ${String(concurrency).padEnd(33)} ║
║  Scans / scanner:      ${String(iterations).padEnd(33)} ║
║  Total requêtes:       ${String(concurrency * iterations).padEnd(33)} ║
║  Pool badges:          ${String(badgeCodes.length).padEnd(33)} ║
║  RPC:                  ${rpcMode.padEnd(33)} ║
╚════════════════════════════════════════════════════════════╝
  `);

  const results = [];
  let cursor = 0;

  async function scannerWorker(workerId) {
    for (let i = 0; i < iterations; i += 1) {
      const code = badgeCodes[cursor % badgeCodes.length];
      cursor += 1;
      const r = await rpcScanBadge(url, anonKey, code, rpcMode);
      results.push({ ...r, workerId, iteration: i + 1 });
      if (i === 0 || (i + 1) % 5 === 0) {
        process.stdout.write(`scanner ${workerId}: ${i + 1}/${iterations} last=${r.ms.toFixed(0)}ms ${r.ok ? 'OK' : 'FAIL'}\n`);
      }
    }
  }

  const startAll = performance.now();
  await Promise.all(Array.from({ length: concurrency }, (_, i) => scannerWorker(i + 1)));
  const totalMs = performance.now() - startAll;

  const latencies = results.map((r) => r.ms);
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const failRate = results.length ? Number(((fail / results.length) * 100).toFixed(2)) : 0;

  const summary = {
    scenario: 'badge_scan_entrance',
    rpc: rpcMode,
    concurrency,
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

  printSummary('BADGE SCAN LOAD TEST', summary);

  const passed = checkThresholds(
    { failRate: summary.failRate, latency: summary.latency },
    { maxFailRate, maxP95 }
  );
  process.exit(passed ? 0 : 1);
}

main().catch((e) => {
  console.error('LOAD BADGE SCAN ERROR', e);
  process.exit(1);
});
