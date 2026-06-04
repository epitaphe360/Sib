/**
 * Télécharge les photos Unsplash dans assets/images/ pour l'APK offline.
 * Usage: npm run download-images
 */
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../assets/images');
const bannerSrc = path.resolve(__dirname, '../../../public/banners/urbaevent-banner.jpg');

const UNSPLASH = 'https://images.unsplash.com';

const images = [
  { name: 'hero.jpg', id: 'photo-1541888946425-d81bb19240f5', w: 1200, h: 700 },
  { name: 'networking.jpg', id: 'photo-1515187029135-18ee286d815b', w: 800, h: 500 },
  { name: 'expo.jpg', id: 'photo-1511795409834-ef04bbd61622', w: 800, h: 500 },
  { name: 'morocco.jpg', id: 'photo-1539020140153-e479b8c22e70', w: 800, h: 500 },
  { name: 'conference.jpg', id: 'photo-1475721027785-f74eccf877e2', w: 800, h: 500 },
  { name: 'construction.jpg', id: 'photo-1503387762-592deb58ef4e', w: 800, h: 500 },
  { name: 'architecture.jpg', id: 'photo-1487958449943-2429e8be8625', w: 800, h: 500 },
];

function url(id, w, h) {
  const p = new URLSearchParams({ auto: 'format', fit: 'crop', q: '85', w: String(w), h: String(h) });
  return `${UNSPLASH}/${id}?${p}`;
}

await mkdir(outDir, { recursive: true });

for (const img of images) {
  const res = await fetch(url(img.id, img.w, img.h));
  if (!res.ok) throw new Error(`Failed ${img.name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(outDir, img.name), buf);
  console.log(`✓ ${img.name}`);
}

try {
  await copyFile(bannerSrc, path.join(outDir, 'banner.jpg'));
  console.log('✓ banner.jpg (depuis public/banners)');
} catch {
  await writeFile(path.join(outDir, 'banner.jpg'), await fetch(url('photo-1541888946425-d81bb19240f5', 1200, 400)).then((r) => r.arrayBuffer()).then(Buffer.from));
  console.log('✓ banner.jpg (fallback Unsplash)');
}

console.log('Images prêtes dans assets/images/');
