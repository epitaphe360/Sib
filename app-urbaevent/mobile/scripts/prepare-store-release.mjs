/**
 * Vérifie la préparation Play Store / EAS avant release.
 * Usage: node scripts/prepare-store-release.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
const easJson = readFileSync(join(root, 'eas.json'), 'utf8');
const qrTs = readFileSync(join(root, 'src/api/qr.ts'), 'utf8');

const checks = [
  {
    name: 'Package Android com.urbacom.urbaevent',
    ok: appJson.expo?.android?.package === 'com.urbacom.urbaevent',
  },
  {
    name: 'Pas de JWT secret dans eas.json',
    ok: !easJson.includes('EXPO_PUBLIC_JWT_SECRET'),
  },
  {
    name: 'QR badge via Edge Function (pas de secret client)',
    ok: qrTs.includes("invoke('issue-badge-token'") && !qrTs.includes('EXPO_PUBLIC_JWT_SECRET'),
  },
  {
    name: 'Production: quick-login désactivé',
    ok: easJson.includes('"EXPO_PUBLIC_ENABLE_QUICK_LOGIN": "false"'),
  },
  {
    name: 'Edge Function issue-badge-token présente',
    ok: existsSync(join(root, '../../supabase/functions/issue-badge-token/index.ts')),
  },
  {
    name: 'Edge Function send-expo-push présente',
    ok: existsSync(join(root, '../../supabase/functions/send-expo-push/index.ts')),
  },
  {
    name: 'Tests Maestro e2e définis',
    ok: existsSync(join(root, 'e2e/01-login-smoke.yaml')),
  },
  {
    name: 'EAS projectId (eas init ou EXPO_PUBLIC_EAS_PROJECT_ID)',
    ok: Boolean(
      (appJson.expo?.extra?.eas?.projectId && appJson.expo.extra.eas.projectId !== 'REPLACE_AFTER_eas_init') ||
      existsSync(join(root, 'app.config.js')),
    ),
  },
];

console.log('\n=== Préparation Play Store UrbaEvent ===\n');
let failed = 0;
for (const c of checks) {
  const icon = c.ok ? '✓' : '✗';
  console.log(`  ${icon} ${c.name}`);
  if (!c.ok) failed++;
}

console.log(`\n${checks.length - failed}/${checks.length} OK\n`);
if (failed) {
  console.log('Actions manuelles restantes:');
  console.log('  1. eas login && eas init  → renseigner projectId');
  console.log('  2. eas secret:create pour Supabase (pas dans git)');
  console.log('  3. supabase functions deploy issue-badge-token send-expo-push');
  console.log('  4. Play Console → Internal testing track');
  console.log('  5. npm run setup:demo && npm run checklist\n');
  process.exit(1);
}
console.log('✅ Prêt pour build store (hors credentials EAS/Play).\n');
