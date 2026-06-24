#!/usr/bin/env node
/**
 * Crée le bucket auth-bridge et uploade mobile-auth.html (page pont email → app).
 * Usage: node supabase/scripts/upload-auth-bridge.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const key =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const supabase = createClient(url, key);
const htmlPath = join(__dirname, '../assets/mobile-auth.html');
const html = readFileSync(htmlPath, 'utf8');

const { error: bucketError } = await supabase.storage.createBucket('auth-bridge', {
  public: true,
  fileSizeLimit: 1048576,
  allowedMimeTypes: ['text/html'],
});
if (bucketError && !bucketError.message.includes('already exists')) {
  console.warn('Bucket create:', bucketError.message);
}

await supabase.storage.updateBucket('auth-bridge', {
  public: true,
  allowedMimeTypes: ['text/html'],
}).catch(() => undefined);

const { error: uploadError } = await supabase.storage
  .from('auth-bridge')
  .upload('mobile-auth.html', html, {
    contentType: 'text/html',
    cacheControl: '3600',
    upsert: true,
  });

if (uploadError) {
  console.error('❌ Upload:', uploadError.message);
  process.exit(1);
}

const publicUrl = `${url}/storage/v1/object/public/auth-bridge/mobile-auth.html`;
console.log('✓ mobile-auth.html uploadé');
console.log('  URL:', publicUrl);
