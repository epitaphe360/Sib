/**
 * Télécharge l'icône Play Store com.urbavent (référence UrbaEvent Aeon360).
 * Fallback : génère un master SVG haute qualité si les sources externes échouent.
 *
 * Usage: node scripts/fetch-playstore-logo.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.resolve(__dirname, '../assets/brand');
const outPath = path.join(brandDir, 'urbaevent-logo-master.png');

const SOURCES = [
  'https://icon.horse/icon/com.urbavent',
  'https://www.google.com/s2/favicons?domain=play.google.com&sz=512',
];

const PRIMARY = '#1B365D';
const LIGHT = '#2E5984';
const ACCENT = '#4598D1';

async function tryDownload(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UrbaEvent/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return null;
  return buf;
}

function fallbackSvg(size = 1024) {
  const r = Math.round(size * 0.18);
  const fontMain = Math.round(size * 0.11);
  const fontSub = Math.round(size * 0.045);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${LIGHT}"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="#F39200"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.36}" fill="none" stroke="url(#ring)" stroke-width="${size*0.018}" opacity="0.85"/>
  <text x="50%" y="46%" text-anchor="middle" fill="#ffffff" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontMain}" font-weight="700" letter-spacing="2">URBA</text>
  <text x="50%" y="58%" text-anchor="middle" fill="#F39200" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontMain}" font-weight="700" letter-spacing="2">EVENT</text>
  <text x="50%" y="68%" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="system-ui,Segoe UI,sans-serif" font-size="${fontSub}" letter-spacing="3">URBACOM</text>
</svg>`);
}

await mkdir(brandDir, { recursive: true });

let source = 'fallback-svg';
let input = null;

for (const url of SOURCES) {
  try {
    const buf = await tryDownload(url);
    if (buf) {
      input = buf;
      source = url;
      break;
    }
  } catch {
    // try next
  }
}

if (!input) {
  input = fallbackSvg(1024);
  console.warn('Sources externes indisponibles — master généré depuis SVG UrbaEvent.');
}

await sharp(input)
  .resize(1024, 1024, { fit: 'contain', background: { r: 27, g: 54, b: 93, alpha: 1 } })
  .png()
  .toFile(outPath);

await writeFile(
  path.join(brandDir, 'SOURCE.txt'),
  `UrbaEvent logo master\nSource: ${source}\nPackage ref: com.urbavent (Play Store)\nGenerated: ${new Date().toISOString()}\n`,
);

console.log(`✓ ${outPath} (${source})`);
