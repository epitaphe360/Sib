/**
 * Test de charge — API Supabase REST (lectures salon)
 *
 * Simule consultation programme, exposants, articles en parallèle.
 *
 * Usage:
 *   npm run load:supabase-api
 */
import { performance } from 'node:perf_hooks';
import {
  createSupabaseClients,
  restSelect,
  summarizeLatencies,
  printSummary,
  checkThresholds,
} from './load/shared.mjs';

const concurrency = Number(process.env.LOAD_API_CONCURRENCY || 40);
const iterations = Number(process.env.LOAD_API_ITERATIONS || 10);
const maxFailRate = Number(process.env.LOAD_API_MAX_FAIL_RATE || 2);
const maxP95 = Number(process.env.LOAD_API_MAX_P95_MS || 1000);

const ENDPOINTS = [
  { table: 'exhibitors', query: 'select=id,company_name,sector&verified=eq.true&is_published=eq.true&limit=50' },
  { table: 'events', query: 'select=id,title,start_date&limit=30&order=start_date.asc' },
  { table: 'news_articles', query: 'select=id,title&limit=10&order=created_at.desc' },
];

async function main() {
  const { url, anonKey } = createSupabaseClients();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  LOAD TEST — API Supabase (lectures salon)                 ║
║  Concurrence: ${String(concurrency).padEnd(42)} ║
║  Itérations:  ${String(iterations).padEnd(42)} ║
╚════════════════════════════════════════════════════════════╝
  `);

  const results = [];

  async function worker(workerId) {
    for (let i = 0; i < iterations; i += 1) {
      const ep = ENDPOINTS[i % ENDPOINTS.length];
      const r = await restSelect(url, anonKey, ep.table, ep.query);
      results.push({ ...r, workerId, endpoint: ep.table });
    }
  }

  const startAll = performance.now();
  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));
  const totalMs = performance.now() - startAll;

  const latencies = results.map((r) => r.ms);
  const ok = results.filter((r) => r.ok).length;
  const failRate = results.length
    ? Number(((results.length - ok) / results.length * 100).toFixed(2))
    : 0;

  const byEndpoint = Object.fromEntries(
    ENDPOINTS.map((ep) => {
      const rows = results.filter((r) => r.endpoint === ep.table);
      return [ep.table, summarizeLatencies(rows.map((r) => r.ms))];
    })
  );

  const summary = {
    scenario: 'supabase_rest_reads',
    concurrency,
    iterations,
    totalRequests: results.length,
    ok,
    fail: results.length - ok,
    failRate,
    durationSec: Number((totalMs / 1000).toFixed(2)),
    rps: Number((results.length / (totalMs / 1000)).toFixed(2)),
    latency: summarizeLatencies(latencies),
    byEndpoint,
    thresholds: { maxFailRate, maxP95 },
  };

  printSummary('SUPABASE API LOAD TEST', summary);

  const passed = checkThresholds(
    { failRate: summary.failRate, latency: summary.latency },
    { maxFailRate, maxP95 }
  );
  process.exit(passed ? 0 : 1);
}

main().catch((e) => {
  console.error('LOAD SUPABASE API ERROR', e);
  process.exit(1);
});
