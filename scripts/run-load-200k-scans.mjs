/**
 * Test de charge distribué — 200 000 scans QR sur la durée de l'événement
 *
 * Les 200k visiteurs ne scannent pas en même temps : le script envoie des vagues
 * avec concurrence limitée (défaut 200 portiques actifs en parallèle).
 *
 * Chaque scan = QR JSON app + enregistrement access_logs.
 *
 * Usage:
 *   npm run load:200k-scans          # échantillon 10 000 (rapide, ~2 min)
 *   npm run load:200k-scans:full     # 200 000 scans complets (~15-25 min)
 *   LOAD_TOTAL_SCANS=50000 npm run load:200k-scans
 */
import { performance } from 'node:perf_hooks';
import {
  createSupabaseClients,
  signInStaff,
  fetchAppQrPool,
  fetchSalonContext,
  countTable,
  scanQrAppJourney,
  summarizeLatencies,
  printSummary,
} from './load/shared.mjs';

const FULL_200K = process.argv.includes('--full');
const totalScans = FULL_200K
  ? 200000
  : Number(process.env.LOAD_TOTAL_SCANS || 10000);
const concurrency = Number(process.env.LOAD_SCAN_CONCURRENCY || 200);
const batchPauseMs = Number(process.env.LOAD_BATCH_PAUSE_MS || 50);
const maxFailRate = Number(process.env.LOAD_MAX_FAIL_RATE || 2);
const maxP95 = Number(process.env.LOAD_MAX_P95_MS || 2000);

async function runBatch(batchItems, url, anonKey, staffToken, ctx) {
  return Promise.all(
    batchItems.map((item) =>
      scanQrAppJourney(url, anonKey, staffToken, item.qrPayload, ctx)
    )
  );
}

async function main() {
  const { url, anonKey, admin, anon } = createSupabaseClients();
  const staffSession = await signInStaff(anon);
  const salon = await fetchSalonContext(admin);
  const qrPool = await fetchAppQrPool(admin, 2000);

  if (!qrPool.length) {
    console.error('Pool QR vide — impossible de simuler 200k scans.');
    process.exit(2);
  }

  const marker = `load-test-200k-${Date.now()}`;
  const logsBefore = await countTable(admin, 'access_logs');
  const startIso = new Date().toISOString();

  const ctx = {
    scannedBy: staffSession.user.id,
    salonId: salon.salonId,
    salonName: salon.salonName,
    scannerDevice: marker,
    zone: 'public',
  };

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  LOAD TEST — ${totalScans.toLocaleString('fr-FR')} scans QR distribués (200k événement)   ║
║  Concurrence max (portiques): ${String(concurrency).padEnd(30)} ║
║  Pool badges QR:              ${String(qrPool.length).padEnd(30)} ║
║  Mode:                        ${(FULL_200K ? 'FULL 200k' : 'SAMPLE').padEnd(30)} ║
╚══════════════════════════════════════════════════════════════╝
  `);

  const results = [];
  let cursor = 0;
  const t0 = performance.now();
  let completed = 0;

  while (completed < totalScans) {
    const batchSize = Math.min(concurrency, totalScans - completed);
    const batch = [];
    for (let i = 0; i < batchSize; i += 1) {
      batch.push(qrPool[cursor % qrPool.length]);
      cursor += 1;
    }

    const batchResults = await runBatch(batch, url, anonKey, staffSession.access_token, ctx);
    results.push(...batchResults);
    completed += batchSize;

    const pct = ((completed / totalScans) * 100).toFixed(1);
    const ok = batchResults.filter((r) => r.ok).length;
    process.stdout.write(
      `vague ${completed}/${totalScans} (${pct}%) · batch ok=${ok}/${batchSize}\n`
    );

    if (batchPauseMs > 0 && completed < totalScans) {
      await new Promise((r) => setTimeout(r, batchPauseMs));
    }
  }

  const durationSec = (performance.now() - t0) / 1000;
  const logsAfter = await countTable(admin, 'access_logs');
  const logsNewMarked = await countTable(admin, 'access_logs', startIso);

  const latencies = results.map((r) => r.ms);
  const ok = results.filter((r) => r.ok).length;
  const logged = results.filter((r) => r.logged).length;
  const failRate = Number(((results.length - ok) / results.length * 100).toFixed(2));
  const logFailRate = Number(((results.length - logged) / results.length * 100).toFixed(2));

  const summary = {
    scenario: 'distributed_200k_qr_scans',
    totalScansTarget: totalScans,
    totalScansDone: results.length,
    concurrency,
    validationOk: ok,
    failRate,
    accessLogsWritten: logged,
    accessLogFailRate: logFailRate,
    db: {
      access_logs_before: logsBefore,
      access_logs_after: logsAfter,
      access_logs_delta: logsAfter - logsBefore,
      access_logs_since_start: logsNewMarked,
      allScansStored: logsAfter - logsBefore >= logged - Math.ceil(logged * 0.02),
    },
    durationSec: Number(durationSec.toFixed(2)),
    durationMin: Number((durationSec / 60).toFixed(2)),
    rps: Number((results.length / durationSec).toFixed(2)),
    latency: summarizeLatencies(latencies),
    extrapolation200k: {
      note: 'Si ce test est un échantillon, multiplier rps × durée pour estimer 200k',
      estimatedMinutesFor200k: Number(((200000 / (results.length / durationSec)) / 60).toFixed(1)),
    },
    sampleErrors: [...new Set(results.filter((r) => !r.ok).map((r) => r.error))].slice(0, 5),
  };

  printSummary(`DISTRIBUTED ${totalScans} SCANS`, summary);

  const latency = summarizeLatencies(latencies);
  const passed =
    failRate <= maxFailRate &&
    logFailRate <= maxFailRate &&
    latency.p95 <= maxP95 &&
    summary.db.allScansStored;

  if (!passed) {
    console.error('FAILED — voir seuils ou stockage access_logs');
    process.exit(1);
  }
  console.log('PASSED — scans QR validés et stockés en base');
}

main().catch((e) => {
  console.error('LOAD 200K SCANS ERROR', e);
  process.exit(1);
});
