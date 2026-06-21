/**
 * Génère les icônes Expo à partir du logo master UrbaEvent (Play Store ref).
 * Prérequis: node scripts/fetch-playstore-logo.mjs
 * Usage: npm run generate-icons
 */
import { access, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../assets');
const brandDir = path.join(assetsDir, 'brand');
const masterPath = path.join(brandDir, 'urbaevent-logo-master.png');

const PRIMARY = '#1B365D';
const LIGHT = '#2E5984';

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureMaster() {
  if (await fileExists(masterPath)) return readFile(masterPath);
  const { spawn } = await import('node:child_process');
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'fetch-playstore-logo.mjs')], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error('fetch-playstore-logo failed'))));
  });
  return readFile(masterPath);
}

async function writePng(name, width, height, pipeline) {
  const out = path.join(assetsDir, name);
  await pipeline.resize(width, height).png().toFile(out);
  console.log(`✓ ${name} (${width}x${height})`);
}

async function splashSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${LIGHT}"/>
    </linearGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="72" font-weight="700" letter-spacing="4">URBAEVENT</text>
  <text x="50%" y="58%" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif" font-size="36">Plateforme digitale multi-salons</text>
</svg>`);
}

await mkdir(assetsDir, { recursive: true });
const master = await ensureMaster();

const logo1024 = sharp(master).resize(820, 820, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

await writePng('icon.png', 1024, 1024, sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 27, g: 54, b: 93, alpha: 1 } },
}).composite([{ input: await logo1024.png().toBuffer(), gravity: 'centre' }]));

await writePng('adaptive-icon.png', 1024, 1024, sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 27, g: 54, b: 93, alpha: 1 } },
}).composite([{ input: await sharp(master).resize(660, 660, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), gravity: 'centre' }]));

await writePng('notification-icon.png', 96, 96, sharp(master).resize(96, 96, { fit: 'contain', background: { r: 27, g: 54, b: 93, alpha: 1 } }));

const splashLogo = await sharp(master).resize(480, 480, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await writePng('splash.png', 1284, 2778, sharp(await splashSvg()).composite([{ input: splashLogo, gravity: 'centre' }]));

console.log('Assets générés depuis assets/brand/urbaevent-logo-master.png');
