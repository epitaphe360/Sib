/**
 * Suite qualité UrbaEvent mobile — à lancer avant livraison client.
 * Politique stricte : 0 FAIL, 0 WARN.
 *
 * Usage:
 *   node scripts/run-quality-suite.mjs           # complet (avec API si .env)
 *   node scripts/run-quality-suite.mjs --offline # sans API Supabase
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dir, '..');
const monorepoRoot = join(mobileRoot, '../..');
const offline = process.argv.includes('--offline');

const steps = [
  {
    id: 'typecheck',
    label: 'TypeScript (0 erreur)',
    cwd: mobileRoot,
    cmd: 'npm',
    args: ['run', 'typecheck'],
  },
  {
    id: 'unit',
    label: 'Tests unitaires Vitest (mobile)',
    cwd: monorepoRoot,
    cmd: 'npx',
    args: ['vitest', 'run', 'tests/unit/mobile', '--reporter=verbose'],
  },
  {
    id: 'coverage',
    label: 'Couverture logique 100 %',
    cwd: monorepoRoot,
    cmd: 'npx',
    args: ['vitest', 'run', 'tests/unit/mobile', '--config', 'vitest.mobile.config.ts', '--coverage'],
  },
  {
    id: 'brand',
    label: 'Assets logo UrbaEvent',
    cwd: mobileRoot,
    cmd: 'node',
    args: ['scripts/verify-brand-logos.mjs'],
  },
];

if (!offline) {
  steps.push({
    id: 'api',
    label: 'Checklist API Supabase (auth, QR, salons)',
    cwd: mobileRoot,
    cmd: 'node',
    args: ['scripts/run-salon-checklist.mjs'],
  });
}

function runStep(step) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(step.cmd, step.args, {
      cwd: step.cwd,
      shell: true,
      stdio: 'pipe',
    });
    let out = '';
    child.stdout?.on('data', (d) => { out += d; process.stdout.write(d); });
    child.stderr?.on('data', (d) => { out += d; process.stderr.write(d); });
    child.on('close', (code) => {
      resolve({
        ...step,
        ok: code === 0,
        ms: Date.now() - start,
        output: out.slice(-2000),
      });
    });
  });
}

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║  SUITE QUALITÉ URBEVENT — STRICT (0 FAIL/WARN)   ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log(`Mode: ${offline ? 'offline (sans API)' : 'complet'}\n`);

const results = [];
for (const step of steps) {
  console.log(`\n── ${step.label} ──\n`);
  const result = await runStep(step);
  results.push(result);
  const icon = result.ok ? '✓' : '✗';
  console.log(`\n${icon} ${step.label} (${result.ms}ms)\n`);
}

const failed = results.filter((r) => !r.ok);

console.log('\n══════════════════════════════════════════════════');
console.log('RÉSUMÉ');
console.log('══════════════════════════════════════════════════\n');
for (const r of results) {
  console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
}
console.log(`\n  Total: ${results.length} | Pass: ${results.filter((r) => r.ok).length} | Fail: ${failed.length}\n`);

if (failed.length) {
  console.log('❌ Suite échouée — corriger tous les FAIL avant livraison.\n');
  process.exit(1);
}
console.log('✅ Suite qualité validée — 0 FAIL, 0 WARN.\n');
process.exit(0);
