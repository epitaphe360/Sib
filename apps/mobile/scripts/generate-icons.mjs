/**
 * Génère les icônes Expo (icon, splash, adaptive-icon, notification-icon).
 * Usage: npm run generate-icons
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../assets');

const PRIMARY = '#1B365D';
const LIGHT = '#2E5984';

async function createBrandSvg(size, withText = true) {
  const fontSize = Math.round(size * 0.12);
  const subSize = Math.round(size * 0.04);
  const text = withText
    ? `<text x="50%" y="52%" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700">UE</text>
       <text x="50%" y="68%" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="system-ui,sans-serif" font-size="${subSize}">UrbaEvent</text>`
    : `<text x="50%" y="55%" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700">UE</text>`;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${PRIMARY}"/>
        <stop offset="100%" stop-color="${LIGHT}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#g)"/>
    ${text}
  </svg>`);
}

async function writePng(name, width, height, svg) {
  const out = path.join(assetsDir, name);
  await sharp(svg).resize(width, height).png().toFile(out);
  console.log(`✓ ${name} (${width}x${height})`);
}

await mkdir(assetsDir, { recursive: true });

const iconSvg = await createBrandSvg(1024, true);
const adaptiveSvg = await createBrandSvg(1024, false);
const splashSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <rect width="1284" height="2778" fill="${PRIMARY}"/>
  <text x="50%" y="48%" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="120" font-weight="700">UrbaEvent</text>
  <text x="50%" y="52%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui,sans-serif" font-size="48">SIB 2026</text>
</svg>`);

await writePng('icon.png', 1024, 1024, iconSvg);
await writePng('adaptive-icon.png', 1024, 1024, adaptiveSvg);
await writePng('notification-icon.png', 96, 96, adaptiveSvg);
await writePng('splash.png', 1284, 2778, splashSvg);

console.log('Assets générés dans assets/');
