/**
 * Complète apps/mobile/.env (Supabase — sans JWT côté client).
 * Usage: node scripts/ensure-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
const siteUrl = current.EXPO_PUBLIC_SITE_URL ?? root.VITE_SITE_URL ?? 'https://www.urbaevent.com';
const paymentEnabled = current.EXPO_PUBLIC_PAYMENT_ENABLED ?? 'true';
const quickLogin = current.EXPO_PUBLIC_ENABLE_QUICK_LOGIN ?? 'false';
const easProjectId = current.EXPO_PUBLIC_EAS_PROJECT_ID ?? '';

if (!url || !anon) {
  console.error('❌ URL/anon manquants. Renseignez apps/mobile/.env ou racine .env');
  process.exit(1);
}

const lines = [
  '# Généré par scripts/ensure-env.mjs — ne pas committer',
  '# JWT badge : Edge Function issue-badge-token uniquement (pas de secret client)',
  `EXPO_PUBLIC_SUPABASE_URL=${url}`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
  `EXPO_PUBLIC_SITE_URL=${siteUrl}`,
  `EXPO_PUBLIC_PAYMENT_ENABLED=${paymentEnabled}`,
  `EXPO_PUBLIC_ENABLE_QUICK_LOGIN=${quickLogin}`,
  ...(easProjectId ? [`EXPO_PUBLIC_EAS_PROJECT_ID=${easProjectId}`] : []),
  '',
];

writeFileSync(mobileEnv, lines.join('\n'), 'utf8');
console.log('✓ .env mobile mis à jour (sans JWT client)');
