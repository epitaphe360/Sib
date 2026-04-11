import process from 'node:process';
import { performance } from 'node:perf_hooks';

const baseUrl = process.env.LOAD_BASE_URL || 'http://localhost:9323';
const concurrency = Number(process.env.LOAD_CONCURRENCY || 30);
const iterations = Number(process.env.LOAD_ITERATIONS || 8);

const targets = [
  '/',
  '/exhibitors',
  '/partners',
  '/news',
  '/networking',
];

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function hit(pathname) {
  const url = `${baseUrl}${pathname}`;
  const start = performance.now();
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const elapsed = performance.now() - start;
    return { ok: res.ok, status: res.status, ms: elapsed, path: pathname };
  } catch (error) {
    const elapsed = performance.now() - start;
    return { ok: false, status: 0, ms: elapsed, path: pathname, error: String(error) };
  }
}

async function runBatch() {
  const jobs = [];
  for (let i = 0; i < concurrency; i += 1) {
    const path = targets[i % targets.length];
    jobs.push(hit(path));
  }
  return Promise.all(jobs);
}

async function main() {
  console.log(`LOAD SMOKE start: baseUrl=${baseUrl}, concurrency=${concurrency}, iterations=${iterations}`);

  const all = [];
  for (let i = 0; i < iterations; i += 1) {
    const batch = await runBatch();
    all.push(...batch);
    const okCount = batch.filter(r => r.ok).length;
    console.log(`iteration ${i + 1}/${iterations}: ok=${okCount}/${batch.length}`);
  }

  const latencies = all.map(r => r.ms);
  const ok = all.filter(r => r.ok).length;
  const total = all.length;
  const fail = total - ok;
  const failRate = total ? (fail / total) * 100 : 0;

  const byPath = Object.fromEntries(
    targets.map(path => {
      const rows = all.filter(r => r.path === path);
      const localLatency = rows.map(r => r.ms);
      return [
        path,
        {
          count: rows.length,
          fail: rows.filter(r => !r.ok).length,
          p95: Number(percentile(localLatency, 95).toFixed(2)),
          p99: Number(percentile(localLatency, 99).toFixed(2)),
          avg: Number((localLatency.reduce((a, b) => a + b, 0) / (localLatency.length || 1)).toFixed(2)),
        },
      ];
    })
  );

  const summary = {
    baseUrl,
    concurrency,
    iterations,
    total,
    ok,
    fail,
    failRate: Number(failRate.toFixed(2)),
    p95: Number(percentile(latencies, 95).toFixed(2)),
    p99: Number(percentile(latencies, 99).toFixed(2)),
    avg: Number((latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(2)),
    byPath,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (summary.failRate > 2 || summary.p95 > 1200) {
    console.error('LOAD SMOKE FAILED: thresholds exceeded (failRate > 2% or p95 > 1200ms)');
    process.exit(1);
  }

  console.log('LOAD SMOKE PASSED');
}

main().catch((error) => {
  console.error('LOAD SMOKE ERROR', error);
  process.exit(1);
});
