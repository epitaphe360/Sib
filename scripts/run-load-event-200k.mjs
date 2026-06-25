/**
 * Test de charge — profil 200 000 visiteurs (SIB 2026)
 *
 * Modélisation :
 *   - 200k visiteurs / 5 jours ≈ 40k/jour
 *   - Pic entrée : ~100 portiques virtuels × 30 scans
 *   - Pic app : ~150 users QR simultanés × 8 refresh
 *   - Pic consultation : ~200 lectures API simultanées × 25
 *
 * Usage:
 *   npm run load:event-200k
 *   npm run load:event-200k:light   (50% charge)
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const LIGHT = process.argv.includes('--light');

const scale = LIGHT ? 0.5 : 1;

const steps = [
  {
    name: 'Scans entrée (validate_scanned_badge)',
    script: 'run-load-badge-scan.mjs',
    env: {
      LOAD_SCAN_RPC: process.env.LOAD_SCAN_RPC || 'validate',
      LOAD_SCAN_CONCURRENCY: String(Math.round(100 * scale)),
      LOAD_SCAN_ITERATIONS: String(Math.round(30 * scale)),
      LOAD_SCAN_MAX_P95_MS: '1000',
    },
  },
  {
    name: 'API Supabase (programme + exposants)',
    script: 'run-load-supabase-api.mjs',
    env: {
      LOAD_API_CONCURRENCY: String(Math.round(200 * scale)),
      LOAD_API_ITERATIONS: String(Math.round(25 * scale)),
      LOAD_API_MAX_P95_MS: '1200',
    },
  },
  {
    name: 'QR dynamique (issue-badge-token)',
    script: 'run-load-qr-token.mjs',
    env: {
      LOAD_QR_CONCURRENCY: String(Math.round(150 * scale)),
      LOAD_QR_ITERATIONS: String(Math.round(8 * scale)),
      LOAD_QR_MAX_P95_MS: '2000',
    },
  },
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ ${step.name}`);
    console.log(`   env: ${JSON.stringify(step.env)}\n`);
    const child = spawn(process.execPath, [join(__dir, step.script)], {
      cwd: root,
      env: { ...process.env, ...step.env },
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${step.name} → exit ${code}`));
    });
  });
}

async function main() {
  const totalScans = Math.round(100 * scale) * Math.round(30 * scale);
  const totalApi = Math.round(200 * scale) * Math.round(25 * scale);
  const totalQr = Math.round(150 * scale) * Math.round(8 * scale);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  SIB 2026 — Test de charge 200 000 visiteurs                 ║
║  Mode: ${(LIGHT ? 'LIGHT (50%)' : 'FULL').padEnd(52)} ║
║  Scans entrée ciblés:     ${String(totalScans).padEnd(36)} ║
║  Lectures API ciblées:    ${String(totalApi).padEnd(36)} ║
║  Refresh QR ciblés:       ${String(totalQr).padEnd(36)} ║
╚══════════════════════════════════════════════════════════════╝
  `);

  const report = [];
  for (const step of steps) {
    try {
      await runStep(step);
      report.push({ step: step.name, status: 'PASS' });
    } catch (e) {
      report.push({ step: step.name, status: 'FAIL', error: e.message });
    }
  }

  console.log('\n═══ RAPPORT 200K VISITEURS ═══');
  console.table(report);

  const failed = report.filter((r) => r.status === 'FAIL');
  if (failed.length) {
    console.error('\n⚠️  Échecs détectés. Vérifiez :');
    console.error('   1. Migration 20260626000002_fix_validate_scanned_badge_v2.sql appliquée');
    console.error('   2. Supabase Dashboard → CPU / connexions pendant le test');
    process.exit(1);
  }
  console.log('\n✅ Tous scénarios PASS — plateforme OK pour profil 200k visiteurs (pic modélisé)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
