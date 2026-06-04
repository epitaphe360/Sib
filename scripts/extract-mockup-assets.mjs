/**
 * Extrait et optimise les visuels SIB 2026.
 *
 * Sources :
 *  - Hero hall HD : public/banners/hero-hall-reference.png (2053×1369)
 *  - Maquette page : public/banners/mockup-sib2026-reference.png (2560×3841)
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/mockup');
const HERO_SRC = join(ROOT, 'public/banners/hero-hall-reference.png');
const MOCKUP_SRC = join(ROOT, 'public/banners/mockup-sib2026-reference.png');

const RESIZE = { kernel: sharp.kernel.lanczos3, withoutEnlargement: false };

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/** Régions % calibrées sur maquette portrait 2560×3841 */
const REGIONS_PCT = {
  portrait1: { left: 0.498, top: 0.391, width: 0.118, height: 0.104 },
  portrait2: { left: 0.618, top: 0.391, width: 0.118, height: 0.104 },
  portrait3: { left: 0.738, top: 0.391, width: 0.118, height: 0.104 },
  portrait4: { left: 0.855, top: 0.391, width: 0.132, height: 0.104 },
  timeline1: { left: 0.198, top: 0.604, width: 0.118, height: 0.055 },
  timeline2: { left: 0.322, top: 0.604, width: 0.118, height: 0.055 },
  timeline3: { left: 0.446, top: 0.604, width: 0.118, height: 0.055 },
  timeline4: { left: 0.57, top: 0.604, width: 0.118, height: 0.055 },
  timeline5: { left: 0.694, top: 0.604, width: 0.118, height: 0.055 },
  card1: { left: 0.252, top: 0.622, width: 0.362, height: 0.098 },
  card2: { left: 0.622, top: 0.622, width: 0.362, height: 0.098 },
  card3: { left: 0.252, top: 0.716, width: 0.362, height: 0.098 },
  card4: { left: 0.622, top: 0.716, width: 0.362, height: 0.098 },
  card5: { left: 0.252, top: 0.81, width: 0.362, height: 0.098 },
  card6: { left: 0.622, top: 0.81, width: 0.362, height: 0.098 },
  /** Bloc CTA pré-footer : photo bâtiment à droite (Figma) */
  reservePhoto: { left: 0.51, top: 0.862, width: 0.49, height: 0.048 },
};

function pctToPixels(pct, w, h) {
  return {
    left: Math.max(0, Math.round(pct.left * w)),
    top: Math.max(0, Math.round(pct.top * h)),
    width: Math.min(w - Math.round(pct.left * w), Math.round(pct.width * w)),
    height: Math.min(h - Math.round(pct.top * h), Math.round(pct.height * h)),
  };
}

async function exportAsset(name, input, opts = {}) {
  const { width, height, quality = 95 } = opts;
  let pipeline = sharp(input).rotate();
  if (width || height) {
    pipeline = pipeline.resize(width, height, RESIZE);
  }
  const webpPath = join(OUT, `${name}.webp`);
  const jpgPath = join(OUT, `${name}.jpg`);

  await pipeline.clone().webp({ quality, effort: 6, smartSubsample: true }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: Math.min(quality + 2, 98), mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(jpgPath);
  const meta = await sharp(webpPath).metadata();
  console.log(`✓ ${name} → ${meta.width}×${meta.height} (webp + jpg)`);
}

async function extractFromMockup(name, region, opts = {}) {
  const { width, height } = opts;
  let pipeline = sharp(MOCKUP_SRC).extract(region).rotate();
  if (width || height) {
    pipeline = pipeline.resize(width, height, RESIZE);
  }
  const webpPath = join(OUT, `${name}.webp`);
  const jpgPath = join(OUT, `${name}.jpg`);
  const quality = opts.quality ?? 94;

  await pipeline.clone().webp({ quality, effort: 6, smartSubsample: true }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: Math.min(quality + 2, 98), mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(jpgPath);
  const meta = await sharp(webpPath).metadata();
  console.log(`✓ ${name} → ${meta.width}×${meta.height}`);
}

async function processHero() {
  if (!existsSync(HERO_SRC)) {
    console.warn('⚠ Hero HD absent — fallback extraction depuis maquette');
    const meta = await sharp(MOCKUP_SRC).metadata();
    const region = pctToPixels({ left: 0, top: 0, width: 1, height: 0.265 }, meta.width, meta.height);
    await extractFromMockup('hero-hall', region, { width: 2560, quality: 96 });
    return;
  }

  const meta = await sharp(HERO_SRC).metadata();
  console.log(`Hero HD: ${meta.width}×${meta.height}`);

  // Native + version 2K pour grands écrans (léger upscale Lanczos)
  await exportAsset('hero-hall', HERO_SRC, { width: meta.width, quality: 96 });
  await exportAsset('hero-hall-2k', HERO_SRC, { width: 2560, quality: 95 });

  // Alias compat
  await sharp(join(OUT, 'hero-hall.webp')).toFile(join(OUT, 'hero-bg.webp'));
  await sharp(join(OUT, 'hero-hall.jpg')).toFile(join(OUT, 'hero-bg.jpg'));
  console.log('✓ hero-bg (alias hero-hall)');
}

async function processMockupSections() {
  if (!existsSync(MOCKUP_SRC)) {
    console.warn('⚠ Maquette portrait absente — sections ignorées');
    return;
  }

  const meta = await sharp(MOCKUP_SRC).metadata();
  const W = meta.width;
  const H = meta.height;
  console.log(`Maquette: ${W}×${H}`);

  const R = Object.fromEntries(
    Object.entries(REGIONS_PCT).map(([k, v]) => [k, pctToPixels(v, W, H)]),
  );

  for (let i = 1; i <= 4; i++) {
    await extractFromMockup(`portrait-${i}`, R[`portrait${i}`], { width: 800, quality: 95 });
  }

  for (let i = 1; i <= 5; i++) {
    await extractFromMockup(`timeline-${i}`, R[`timeline${i}`], { width: 640, quality: 94 });
  }

  for (let i = 1; i <= 6; i++) {
    await extractFromMockup(`salon-card-${i}`, R[`card${i}`], { width: 1280, quality: 94 });
  }

  await extractFromMockup('reserve-photo', R.reservePhoto, { width: 1400, quality: 95 });
}

async function main() {
  console.log('=== Extraction assets SIB 2026 (haute qualité) ===\n');
  await processHero();
  console.log('');
  await processMockupSections();
  console.log('\nDone — public/mockup/*.webp + *.jpg');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
