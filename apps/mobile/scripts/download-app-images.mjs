/**
 * Synchronise les visuels professionnels SIB dans assets/images/ (APK offline).
 * Usage: npm run download-images
 *
 * Sources : photos locales SIB + CDN sib.ma (salons, halls, B2B).
 * Aucun stock décoratif (fleurs, paysages).
 */
import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../assets/images');
const mobileRoot = path.resolve(__dirname, '..');
const publicRoot = path.resolve(__dirname, '../../../public');

const CDN = 'https://sib.ma/backend/uploads';

const CDN_IMAGES = [
  { name: 'hall.jpg', url: `${CDN}/ALW_4646_e80870e56f_86f40519c5.jpg` },
  { name: 'b2b.jpg', url: `${CDN}/4_9d2cb5a776.png` },
  { name: 'inauguration.jpg', url: `${CDN}/1_a559ea5363.png` },
  { name: 'sib-ma-hero-bg.jpg', url: `${CDN}/ALW_4646_e80870e56f_86f40519c5.jpg` },
  { name: 'sib-ma-banner-bg.jpg', url: `${CDN}/parc_exposition_eljadida_f4a9052968.png` },
  { name: 'sib-ma-section02.jpg', url: `${CDN}/3_c9f5820a94.png` },
];

const LOCAL_COPIES = [
  { src: path.join(publicRoot, 'sib-ma/static/hero.jpg'), dest: 'hero.jpg' },
  { src: path.join(publicRoot, 'sib-ma/static/banner.jpg'), dest: 'banner.jpg' },
  { src: path.join(publicRoot, 'banners/urbaevent-banner.jpg'), dest: 'banner.jpg' },
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function download(name, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(outDir, name), buf);
  console.log(`✓ ${name} (CDN)`);
}

await mkdir(outDir, { recursive: true });

for (const img of CDN_IMAGES) {
  const dest = path.join(outDir, img.name);
  if (await exists(dest) && (await import('node:fs/promises')).stat(dest).then((s) => s.size > 50000)) {
    console.log(`· ${img.name} (déjà présent)`);
    continue;
  }
  try {
    await download(img.name, img.url);
  } catch (e) {
    console.warn(`⚠ ${img.name}: ${e.message}`);
  }
}

for (const copy of LOCAL_COPIES) {
  if (!(await exists(copy.src))) continue;
  const dest = path.join(outDir, copy.dest);
  const stat = await import('node:fs/promises').then((fs) => fs.stat(copy.src));
  if (stat.size < 10000) continue;
  await copyFile(copy.src, dest);
  console.log(`✓ ${copy.dest} (local)`);
}

console.log('Images professionnelles prêtes dans assets/images/');
