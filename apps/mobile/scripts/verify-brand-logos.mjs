/**
 * Vérifie les assets logo UrbaEvent (local uniquement — zéro dépendance HTTP).
 * Usage: node scripts/verify-brand-logos.mjs
 */
import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');

const LOCAL_FILES = [
  'assets/brand/urbaevent-logo-master.png',
  'assets/brand/logo-sib2026.png',
  'assets/images/logo-sib-salon.png',
  'assets/brand/logo-ministere.png',
  'assets/icon.png',
  'assets/splash.png',
  'assets/adaptive-icon.png',
  'assets/notification-icon.png',
];

const MIN_BYTES = 1024;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

let ok = 0;
let fail = 0;

console.log('\n=== Assets logo UrbaEvent (local) ===\n');
for (const rel of LOCAL_FILES) {
  const full = path.join(mobileRoot, rel);
  if (!(await exists(full))) {
    console.log(`✗ MANQUANT: ${rel}`);
    fail++;
    continue;
  }
  const { size } = await stat(full);
  if (size < MIN_BYTES) {
    console.log(`✗ TROP PETIT (${size}o): ${rel}`);
    fail++;
    continue;
  }
  console.log(`✓ ${rel} (${size}o)`);
  ok++;
}

console.log(`\nRésultat: ${ok} OK, ${fail} échec(s)\n`);
process.exit(fail > 0 ? 1 : 0);
