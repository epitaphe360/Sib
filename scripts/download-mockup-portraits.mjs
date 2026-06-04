/**
 * Télécharge 4 portraits BTP haute résolution (Unsplash) pour la section mission home.
 * Sortie : public/mockup/portrait-{1-4}.jpg + .webp (1920×2880, ratio 2:3)
 *
 * Usage : npm run refresh:portraits
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public/mockup');

const W = 1920;
const H = 2880;

/** Ordre : homme chantier, femme pro, chantier, femme — sources Unsplash (libre) */
const PORTRAITS = [
  {
    file: 'portrait-1',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=2400&h=3600&fit=crop&q=92',
    position: 'top',
  },
  {
    file: 'portrait-2',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=2400&h=3600&fit=crop&q=92',
    position: 'top',
  },
  {
    file: 'portrait-3',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=2400&h=3600&fit=crop&q=92',
    position: 'top',
  },
  {
    file: 'portrait-4',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=2400&h=3600&fit=crop&q=92',
    position: 'top',
  },
];

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SIB2026-asset-script/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processOne({ file, url, position }) {
  console.log(`↓ ${file}…`);
  const input = await downloadBuffer(url);
  const pipeline = sharp(input).rotate().resize(W, H, {
    fit: 'cover',
    position,
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  });

  const webpPath = join(OUT, `${file}.webp`);
  const jpgPath = join(OUT, `${file}.jpg`);

  await pipeline.clone().webp({ quality: 90, effort: 6, smartSubsample: true }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(jpgPath);

  const meta = await sharp(jpgPath).metadata();
  const { statSync } = await import('fs');
  const kb = Math.round(statSync(jpgPath).size / 1024);
  console.log(`✓ ${file} → ${meta.width}×${meta.height} (jpg ~${kb} Ko)`);
}

console.log(`Portraits mission — export ${W}×${H}`);
for (const p of PORTRAITS) {
  await processOne(p);
}
console.log('Terminé.');
