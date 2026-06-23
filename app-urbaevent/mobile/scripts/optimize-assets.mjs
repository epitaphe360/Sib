/**
 * Compresse les PNG/JPG lourds avant build APK.
 * Usage: node scripts/optimize-assets.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dir = fileURLToPath(new URL('.', import.meta.url));
const assetsDir = join(__dir, '..', 'assets');

const MAX_DIM = 1920;
const JPEG_QUALITY = 82;
const PNG_QUALITY = 80;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(jpe?g|png)$/i.test(name)) acc.push(full);
  }
  return acc;
}

let saved = 0;
for (const file of walk(assetsDir)) {
  const before = statSync(file).size;
  if (before < 80_000) continue;
  const ext = extname(file).toLowerCase();
  const img = sharp(file).rotate();
  const meta = await img.metadata();
  let pipeline = img;
  if ((meta.width ?? 0) > MAX_DIM || (meta.height ?? 0) > MAX_DIM) {
    pipeline = pipeline.resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true });
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(file + '.tmp');
  } else {
    await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toFile(file + '.tmp');
  }
  const { renameSync, unlinkSync } = await import('node:fs');
  unlinkSync(file);
  renameSync(file + '.tmp', file);
  const after = statSync(file).size;
  if (after < before) {
    saved += before - after;
    console.log(`✓ ${file.replace(assetsDir, 'assets')} ${Math.round(before / 1024)}→${Math.round(after / 1024)} KB`);
  }
}
console.log(`\nÉconomie totale: ~${Math.round(saved / 1024 / 1024 * 10) / 10} Mo`);
