#!/usr/bin/env node
/**
 * Teste l'envoi OTP Supabase (magic link).
 * Usage: node scripts/test-auth-otp.mjs [email]
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const email = process.argv[2] || 'test@example.com';

if (!url || !key) {
  console.error('Manque EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY dans .env');
  process.exit(1);
}

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
console.log('HTTP', r.status);
console.log(body);

if (r.status === 200) {
  console.log('\nOK — vérifiez la boîte mail (et les spams).');
} else if (body.includes('Error sending magic link email')) {
  console.log('\n→ Activer SMTP Auth dans Supabase Dashboard (voir docs/AUTH-MAGIC-LINK.md).');
  process.exit(2);
}
