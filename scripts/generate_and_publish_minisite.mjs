#!/usr/bin/env node
import { execFileSync } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

async function runCli(url) {
  const scriptPath = path.resolve(process.cwd(), 'scripts', 'ai_generate_minisite.mjs');
  const out = execFileSync(process.execPath, [scriptPath, url], { encoding: 'utf8', timeout: 60000 });
  return JSON.parse(out);
}

function normalizeLogoUrl(logo, baseUrl) {
  if (!logo) return '';
  if (logo.startsWith('//')) return 'https:' + logo;
  try { return new URL(logo, baseUrl).toString(); } catch (e) { return logo; }
}

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D+/g, '');
  if (!digits) return null;
  // If already looks like international (starts with country code length 1-3), prefix +
  return '+' + digits;
}

async function uploadImageIfNeeded(supabase, bucket, remoteUrl) {
  if (!remoteUrl) return null;
  try {
    const res = await fetch(remoteUrl, { timeout: 20000 });
    if (!res.ok) throw new Error('download failed ' + res.status);
    const buffer = await res.arrayBuffer();
    const buf = Buffer.from(buffer);
    const extMatch = remoteUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const hash = crypto.createHash('sha1').update(remoteUrl).digest('hex').slice(0, 12);
    const filename = `${Date.now()}-${hash}.${ext}`;
    const dest = `mini-sites/${filename}`;
    const { data, error } = await supabase.storage.from(bucket).upload(dest, buf, { upsert: true, contentType: res.headers.get('content-type') || `image/${ext}` });
    if (error) {
      console.warn('Supabase upload error', error.message || error);
      return null;
    }
    const pub = supabase.storage.from(bucket).getPublicUrl(dest);
    return pub?.data?.publicUrl || null;
  } catch (e) {
    console.warn('uploadImageIfNeeded failed', e?.message || e);
    return null;
  }
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/generate_and_publish_minisite.mjs <url>');
    process.exit(2);
  }

  console.log('Generating payload for', url);
  const payload = await runCli(url);
  payload.logo = normalizeLogoUrl(payload.logo || payload.sections?.[0]?.content?.logo, url);
  payload.contact = payload.contact || {};
  payload.contact.phone = normalizePhone(payload.contact.phone || payload.sections?.find(s => s.type === 'contact')?.content?.phone || '');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'mini-sites';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. Payload generated but not published.');
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  // Upload logo if present
  let publicLogo = null;
  if (payload.logo) {
    console.log('Uploading logo...');
    publicLogo = await uploadImageIfNeeded(supabase, SUPABASE_BUCKET, payload.logo);
    if (!publicLogo) publicLogo = payload.logo;
  }

  // Create exhibitor
  const exhibitor = {
    company_name: payload.company || 'Sans nom',
    description: payload.description || null,
    logo_url: publicLogo || null,
    website: payload.sourceUrl || url,
    contact_info: { email: payload.contact?.email || null, phone: payload.contact?.phone || null }
  };

  try {
    const { data: exData, error: exErr } = await supabase.from('exhibitors').insert([exhibitor]).select().single();
    if (exErr) throw exErr;
    console.log('Created exhibitor', exData.id);

    // Insert mini_sites
    const mini = {
      exhibitor_id: exData.id,
      theme: 'default',
      custom_colors: {},
      sections: payload.sections || [],
      published: true,
      views: 0,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data: miniData, error: miniErr } = await supabase.from('mini_sites').insert([mini]).select().single();
    if (miniErr) throw miniErr;
    console.log('Created mini-site', miniData.id);
    console.log('Done. Mini-site published.');
    console.log(JSON.stringify({ exhibitor: exData, miniSite: miniData }, null, 2));
  } catch (e) {
    console.error('Publish error', e.message || e);
    process.exit(1);
  }
}

main();
