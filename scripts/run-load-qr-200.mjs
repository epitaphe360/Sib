/**
 * Test de charge — 200 scans QR app simultanés + vérification DB
 *
 * Simule 200 portiques scannant le QR JSON de l'application mobile.
 * Chaque scan : validate_scanned_badge + access_logs (comme scanner sécurité).
 *
 * Usage:
 *   npm run load:qr-200
 *   LOAD_QR_SCANNERS=200 LOAD_QR_SCANS_EACH=3 npm run load:qr-200
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
  checkThresholds,
} from './load/shared.mjs';

const scanners = Number(process.env.LOAD_QR_SCANNERS || 200);
const scansEach = Number(process.env.LOAD_QR_SCANS_EACH || 3);
const maxFailRate = Number(process.env.LOAD_QR_MAX_FAIL_RATE || 2);
const maxP95 = Number(process.env.LOAD_QR_MAX_P95_MS || 5000);

async function main() {
  const { url, anonKey, admin, anon } = createSupabaseClients();
  const staffSession = await signInStaff(anon);
  const salon = await fetchSalonContext(admin);
  const qrPool = await fetchAppQrPool(admin, 500);

  if (!qrPool.length) {
    console.error('Aucun badge actif pour QR app. Vérifiez user_badges + SERVICE_ROLE_KEY.');
    process.exit(2);
  }

  const marker = `load-test-qr-200-${Date.now()}`;
  const logsBefore = await countTable(admin, 'access_logs');
  const startIso = new Date().toISOString();

  const ctx = {
    scannedBy: staffSession.user.id,
    salonId: salon.salonId,
    salonName: salon.salonName,
    scannerDevice: marker,
    zone: 'public',
  };

  const totalTarget = scanners * scansEach;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  LOAD TEST — 200 QR app (scan + stockage DB)                 ║
║  Portiques simultanés: ${String(scanners).padEnd(38)} ║
║  Scans / portique:     ${String(scansEach).padEnd(38)} ║
║  Total scans:          ${String(totalTarget).padEnd(38)} ║
║  Pool QR app:          ${String(qrPool.length).padEnd(38)} ║
║  access_logs avant:    ${String(logsBefore).padEnd(38)} ║
╚══════════════════════════════════════════════════════════════╝
  `);

  if (qrPool.length < scanners) {
    console.warn(`⚠️  Pool ${qrPool.length} badges < ${scanners} portiques — rotation des QR`);
  }

  const results = [];
  let cursor = 0;

  async function portiqueWorker(id) {
    for (let i = 0; i < scansEach; i += 1) {
      const item = qrPool[cursor % qrPool.length];
      cursor += 1;
      const r = await scanQrAppJourney(url, anonKey, staffSession.access_token, item.qrPayload, ctx);
      results.push({ ...r, portique: id });
    }
  }

  const t0 = performance.now();
  const workers = Math.min(scanners, totalTarget);
  await Promise.all(Array.from({ length: workers }, (_, i) => portiqueWorker(i + 1)));
  const durationSec = (performance.now() - t0) / 1000;

  const logsAfter = await countTable(admin, 'access_logs');
  const logsNew = logsAfter - logsBefore;
  const logsNewMarked = await countTable(admin, 'access_logs', startIso);

  const latencies = results.map((r) => r.ms);
  const ok = results.filter((r) => r.ok).length;
  const logged = results.filter((r) => r.logged).length;
  const failRate = results.length ? Number(((results.length - ok) / results.length * 100).toFixed(2)) : 0;
  const logFailRate = results.length ? Number(((results.length - logged) / results.length * 100).toFixed(2)) : 0;

  const summary = {
    scenario: 'qr_app_scan_with_db_log',
    scanners,
    scansEach,
    totalRequests: results.length,
    validationOk: ok,
    validationFail: results.length - ok,
    failRate,
    accessLogsWritten: logged,
    accessLogFailRate: logFailRate,
    db: {
      access_logs_before: logsBefore,
      access_logs_after: logsAfter,
      access_logs_delta: logsNew,
      access_logs_since_start: logsNewMarked,
      storageMatch: logsNewMarked >= logged,
    },
    durationSec: Number(durationSec.toFixed(2)),
    rps: Number((results.length / durationSec).toFixed(2)),
    latency: summarizeLatencies(latencies),
    sampleErrors: [...new Set(results.filter((r) => !r.ok).map((r) => r.error))].slice(0, 5),
    migrationsRequired: [
      '20260626000002_fix_validate_scanned_badge_v2.sql',
      '20260628000002_record_badge_scan_rpc.sql (optionnel, recommandé)',
    ],
  };

  printSummary('QR APP 200 SCAN + DB', summary);

  const passed =
    checkThresholds({ failRate: summary.failRate, latency: summary.latency }, { maxFailRate, maxP95 }) &&
    summary.db.storageMatch &&
    logFailRate <= maxFailRate;

  if (!passed) {
    if (!summary.db.storageMatch) {
      console.error('FAILED: scans non stockés dans access_logs — vérifier migrations + RLS staff');
    }
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('LOAD QR 200 ERROR', e);
  process.exit(1);
});
