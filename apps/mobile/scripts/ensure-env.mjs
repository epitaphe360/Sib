/**
 * Complète apps/mobile/.env (Supabase + JWT pour badge QR).
 * Usage: node scripts/ensure-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dir = dirname(fileURLToPath(import.meta.url));
const mobileDir = join(__dir, '..');
const rootEnv = join(mobileDir, '../..', '.env');
const mobileEnv = join(mobileDir, '.env');

function parseEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const root = parseEnv(rootEnv);
const current = parseEnv(mobileEnv);

const url = current.EXPO_PUBLIC_SUPABASE_URL ?? root.VITE_SUPABASE_URL;
const anon = current.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? root.VITE_SUPABASE_ANON_KEY;
let jwt =
  current.EXPO_PUBLIC_JWT_SECRET ??
  current.EXPO_PUBLIC_VITE_JWT_SECRET ??
  root.VITE_JWT_SECRET ??
  root.JWT_SECRET;

if (!jwt || jwt.length < 32 || jwt.includes('your_') || jwt.includes('SAME_AS')) {
  jwt = 'sib-2026-secure-secret-key-change-in-production';
  console.warn('⚠ JWT: valeur par défaut edge Supabase — définir JWT_SECRET identique dans Supabase + .env');
}

if (!url || !anon) {
  console.error('❌ URL/anon manquants. Renseignez apps/mobile/.env ou racine .env');
  process.exit(1);
}

const lines = [
  '# Généré par scripts/ensure-env.mjs — ne pas committer',
  `EXPO_PUBLIC_SUPABASE_URL=${url}`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
  `EXPO_PUBLIC_JWT_SECRET=${jwt}`,
  '',
];

writeFileSync(mobileEnv, lines.join('\n'), 'utf8');
console.log('✓ .env mobile mis à jour (URL, anon, JWT)');
