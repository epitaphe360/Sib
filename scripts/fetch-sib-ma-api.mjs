/**
 * Télécharge les médias Strapi depuis sib.ma/backend
 */
import { writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/sib-ma');
const API = 'https://sib.ma/backend';
const API_BASE = `${API}/api/`;

const SIB_POPULATE = [
  'about_image', 'bestof_image', 'home_banner', 'banner_default',
  'video_thumbnail', 'team_image', 'counter_background', 'brochure',
].map((f) => `populate[${f}]=true`).join('&');

const ENDPOINTS = [
  `sib?${SIB_POPULATE}`,
  'galeries?populate[image]=true&pagination[pageSize]=100',
  'galeries?populate[photo]=true&pagination[pageSize]=100',
  'galeries?populate[media]=true&pagination[pageSize]=100',
  'editions?populate[image]=true&populate[cover]=true&pagination[pageSize]=30',
  'editions?populate[photo]=true&pagination[pageSize]=30',
  'temoignages?populate[image]=true&populate[avatar]=true&pagination[pageSize]=30',
  'programmes?populate[image]=true&pagination[pageSize]=30',
  'partenaires?populate[logo]=true&populate[image]=true&pagination[pageSize]=100',
  'activite?populate[icon]=true&populate[banner_image]=true&pagination[pageSize]=30',
  'pays?populate[drapeau]=true&populate[flag]=true&pagination[pageSize]=50',
];

function collectMedia(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (obj.url && obj.hash && typeof obj.url === 'string') {
    out.push({
      url: obj.url.startsWith('http') ? obj.url : `${API}${obj.url}`,
      hash: obj.hash,
      name: obj.name || obj.hash,
      width: obj.width,
      ext: obj.ext || '.jpg',
    });
  }
  if (obj.formats && typeof obj.formats === 'object') {
    for (const f of Object.values(obj.formats)) {
      if (f?.url && f?.hash) {
        out.push({
          url: f.url.startsWith('http') ? f.url : `${API}${f.url}`,
          hash: f.hash,
          name: f.name || f.hash,
          width: f.width,
          ext: f.ext || '.jpg',
        });
      }
    }
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') collectMedia(v, out);
  }
  return out;
}

function dedupeBest(media) {
  const byHash = new Map();
  for (const m of media) {
    const existing = byHash.get(m.hash);
    if (!existing || (m.width || 0) > (existing.width || 0)) {
      byHash.set(m.hash, m);
    }
  }
  return [...byHash.values()];
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIB-Platform/1.0' } });
  if (!res.ok) throw new Error(`${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const allMedia = [];
  const apiDump = {};

  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(API_BASE + ep);
      if (!res.ok) {
        console.log(`✗ ${ep.split('?')[0]} → ${res.status}`);
        continue;
      }
      const json = await res.json();
      const key = ep.split('?')[0];
      if (!apiDump[key]) apiDump[key] = json;
      const found = collectMedia(json);
      allMedia.push(...found);
      console.log(`✓ ${key} (+${found.length} media)`);
    } catch (e) {
      console.log(`✗ ${ep}`, e.message);
    }
  }

  writeFileSync(join(ROOT, 'scripts/sib-api-dump.json'), JSON.stringify(apiDump, null, 2));

  const unique = dedupeBest(allMedia);
  writeFileSync(join(OUT, 'media-index.json'), JSON.stringify(unique, null, 2));
  console.log(`\n${unique.length} fichiers uniques\n`);

  let ok = 0;
  for (const m of unique) {
    const safeName = `${m.hash}${m.ext || '.jpg'}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const dest = join(OUT, safeName);
    try {
      await download(m.url, dest);
      console.log(`↓ ${safeName} (${m.width || '?'}px)`);
      ok++;
    } catch (e) {
      console.warn(`✗ ${safeName}`, e.message);
    }
  }
  console.log(`\n${ok}/${unique.length} → public/sib-ma/`);
}

main().catch(console.error);
