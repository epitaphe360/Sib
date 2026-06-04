/**
 * Optimise public/mockup/* UNIQUEMENT depuis public/sib-ma/content.json → imageSlots
 * (mêmes fichiers que https://www.sib.ma/, pas d'autres sources)
 */
import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/mockup');
const CONTENT = join(ROOT, 'public/sib-ma/content.json');

const RESIZE = { kernel: sharp.kernel.lanczos3, withoutEnlargement: false };

function resolveLocal(local) {
  if (!local) return null;
  const path = join(ROOT, 'public', local.replace(/^\//, ''));
  return existsSync(path) ? path : null;
}

async function exportFromSibMa(name, local, width, quality = 92) {
  const file = resolveLocal(local);
  if (!file) {
    console.warn(`⚠ ${name}: fichier sib.ma absent — ${local}`);
    return false;
  }

  let pipeline = sharp(file).rotate();
  if (width) pipeline = pipeline.resize(width, null, RESIZE);

  const webpPath = join(OUT, `${name}.webp`);
  const jpgPath = join(OUT, `${name}.jpg`);

  await pipeline.clone().webp({ quality, effort: 6, smartSubsample: true }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: Math.min(quality + 2, 96), mozjpeg: true }).toFile(jpgPath);

  const meta = await sharp(webpPath).metadata();
  console.log(`✓ ${name} ← ${local} (${meta.width}×${meta.height})`);
  return { local, caption: null };
}

async function main() {
  if (!existsSync(CONTENT)) {
    console.error('Lancez d’abord: npm run sync:sib-ma');
    process.exit(1);
  }
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const { imageSlots } = JSON.parse(readFileSync(CONTENT, 'utf8'));
  const manifest = { builtAt: new Date().toISOString(), source: 'https://www.sib.ma/', slots: {} };

  console.log('=== Assets depuis sib.ma uniquement ===\n');

  const jobs = [
    ['hero-hall', imageSlots.hero?.local, 1920],
    ['hero-hall-2k', imageSlots.hero?.local, 2560],
    ['mission-group', imageSlots.mission?.local, 1600],
    ['reserve-bg', imageSlots.reserve?.local, 1920],
    ['international-map', imageSlots.activiteSecteurs?.local, 512],
    ['salon-card-1', imageSlots.salonCards?.exposer?.local, 960],
    ['salon-card-2', imageSlots.salonCards?.visiter?.local, 960],
    ['salon-card-3', imageSlots.salonCards?.sib_talks?.local, 960],
    ['salon-card-4', imageSlots.salonCards?.b2b?.local, 960],
    ['salon-card-5', imageSlots.salonCards?.diner?.local, 960],
    ['salon-card-6', imageSlots.salonCards?.international?.local, 960],
    ['timeline-1', imageSlots.timeline?.[1986]?.local, 640],
    ['timeline-2', imageSlots.timeline?.[2000]?.local, 640],
    ['timeline-3', imageSlots.timeline?.[2012]?.local, 640],
    ['timeline-4', imageSlots.timeline?.[2022]?.local, 640],
    ['timeline-5', imageSlots.timeline?.[2026]?.local, 640],
  ];

  for (const [name, local, width] of jobs) {
    if (!local) continue;
    const ok = await exportFromSibMa(name, local, width);
    if (ok) {
      manifest.slots[name] = {
        webp: `/mockup/${name}.webp`,
        jpg: `/mockup/${name}.jpg`,
        sibMa: local,
      };
    }
  }

  if (existsSync(join(OUT, 'hero-hall.webp'))) {
    await sharp(join(OUT, 'hero-hall.webp')).toFile(join(OUT, 'hero-bg.webp'));
    await sharp(join(OUT, 'hero-hall.jpg')).toFile(join(OUT, 'hero-bg.jpg'));
  }

  writeFileSync(join(OUT, 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nDone — uniquement photos sib.ma (voir asset-manifest.json)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
