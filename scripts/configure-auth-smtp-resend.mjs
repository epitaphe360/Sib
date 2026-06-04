#!/usr/bin/env node
/**
 * Reconfigure Supabase Auth SMTP via Resend (smtp.resend.com).
 * Nécessite RESEND_API_KEY dans .env (clé re_... du dashboard Resend).
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/configure-auth-smtp-resend.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const configPath = join(root, 'supabase', 'config.toml');

function loadEnv(path) {
  try {
    const out = {};
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i > 0) out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
    return out;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(join(root, '.env')), ...process.env };
const resendKey = env.RESEND_API_KEY;

if (!resendKey || !resendKey.startsWith('re_')) {
  console.error('❌ RESEND_API_KEY manquante (doit commencer par re_)');
  console.error('   1. https://resend.com/api-keys → Create API Key');
  console.error('   2. Ajoutez dans .env : RESEND_API_KEY=re_...');
  console.error('   3. Relancez ce script');
  process.exit(1);
}

const adminEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

let toml = readFileSync(configPath, 'utf8');
const smtpBlock = `[auth.email.smtp]
enabled = true
host = "smtp.resend.com"
port = 465
user = "resend"
pass = "${resendKey.replace(/"/g, '\\"')}"
admin_email = "${adminEmail}"
sender_name = "UrbaEvent SIB"
`;

if (toml.includes('[auth.email.smtp]')) {
  toml = toml.replace(/\[auth\.email\.smtp\][\s\S]*?(?=\n\[|\n*$)/, `${smtpBlock}\n`);
} else {
  toml = toml.replace('[auth.email]', `[auth.email]\n\n${smtpBlock}`);
}

writeFileSync(configPath, toml, 'utf8');
console.log('✓ config.toml → smtp.resend.com');
console.log(`  admin_email: ${adminEmail}`);

process.env.RESEND_API_KEY = resendKey;
execSync('npx supabase config push --yes', { cwd: root, stdio: 'inherit', env: process.env });

console.log('\n✓ Auth SMTP Resend poussé. Test:');
console.log('  cd apps/mobile && node scripts/diagnose-smtp.mjs visitor-free@test.sib2026.ma');
