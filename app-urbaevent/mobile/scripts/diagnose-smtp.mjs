#!/usr/bin/env node
/**
 * Diagnostic SMTP magic link Supabase Auth
 * Usage: node scripts/diagnose-smtp.mjs [email]
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { lookup } from 'dns/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });

const email = process.argv[2] || 'visitor-free@test.sib2026.ma';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const hosts = ['mail.sib2026.ma', 'smtp.resend.com', 'sib.ma', 'sib2026.ma'];

console.log('=== Diagnostic SMTP UrbaEvent ===\n');

console.log('1) Résolution DNS');
for (const host of hosts) {
  try {
    const r = await lookup(host);
    console.log(`   ✓ ${host} → ${r.address}`);
  } catch (e) {
    console.log(`   ✗ ${host} → ${e.code || e.message}`);
  }
}

if (!url || !key) {
  console.error('\n❌ .env mobile incomplet');
  process.exit(1);
}

console.log('\n2) Test magic link Supabase Auth (signInWithOtp)');
const r = await fetch(`${url}/auth/v1/otp`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    email,
    options: { email_redirect_to: 'urbaevent://auth-callback', should_create_user: false },
  }),
});

const body = await r.text();
console.log(`   HTTP ${r.status}`);
console.log(`   ${body.slice(0, 300)}`);

console.log('\n3) Interprétation');
if (body.includes('Error sending magic link email')) {
  console.log('   → GoTrue n’a pas pu envoyer l’email (SMTP Auth).');
  console.log('   → Cause probable: host SMTP invalide (mail.sib2026.ma n’existe pas en DNS).');
  console.log('   → Solution: repasser sur smtp.resend.com (voir scripts/configure-auth-smtp-resend.mjs).');
}
