/**
 * Suite complète de tests de charge — SIB 2026
 *
 * Usage:
 *   npm run load:all
 *   npm run load:all:light   (concurrence réduite, safe sur prod)
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const LIGHT = process.env.LOAD_LIGHT === '1' || process.argv.includes('--light');

const steps = [
  {
    name: 'Web public (smoke)',
    script: 'run-load-smoke.mjs',
    env: LIGHT
      ? { LOAD_CONCURRENCY: '15', LOAD_ITERATIONS: '4' }
      : { LOAD_CONCURRENCY: '40', LOAD_ITERATIONS: '8' },
  },
  {
    name: 'API Supabase (lectures)',
    script: 'run-load-supabase-api.mjs',
    env: LIGHT
      ? { LOAD_API_CONCURRENCY: '20', LOAD_API_ITERATIONS: '5' }
      : { LOAD_API_CONCURRENCY: '40', LOAD_API_ITERATIONS: '10' },
  },
  {
    name: 'Scans badge (entrée)',
    script: 'run-load-badge-scan.mjs',
    env: LIGHT
      ? { LOAD_SCAN_CONCURRENCY: '10', LOAD_SCAN_ITERATIONS: '5' }
      : { LOAD_SCAN_CONCURRENCY: '30', LOAD_SCAN_ITERATIONS: '10' },
  },
  {
    name: 'QR dynamique (app)',
    script: 'run-load-qr-token.mjs',
    env: LIGHT
      ? { LOAD_QR_CONCURRENCY: '10', LOAD_QR_ITERATIONS: '3' }
      : { LOAD_QR_CONCURRENCY: '50', LOAD_QR_ITERATIONS: '4' },
  },
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ ${step.name}\n`);
    const child = spawn(process.execPath, [join(__dir, step.script)], {
      cwd: root,
      env: { ...process.env, ...step.env },
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${step.name} failed (exit ${code})`));
    });
  });
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  SIB 2026 — Suite tests de charge                          ║
║  Mode: ${(LIGHT ? 'LIGHT (prod-safe)' : 'STANDARD').padEnd(49)} ║
╚════════════════════════════════════════════════════════════╝
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

  console.log('\n═══ RAPPORT FINAL ═══');
  console.table(report);

  const failed = report.filter((r) => r.status === 'FAIL');
  if (failed.length) {
    console.error(`${failed.length} scénario(s) en échec`);
    process.exit(1);
  }
  console.log('Tous les scénarios PASS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
