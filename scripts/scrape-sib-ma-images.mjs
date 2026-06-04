/**
 * Extrait les URLs d'images depuis sib.ma (bundle Angular + assets statiques)
 */
import { writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/sib-ma');

const BASE = 'https://www.sib.ma';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIB-Platform/1.0' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIB-Platform/1.0' } });
  if (!res.ok) throw new Error(`Download ${url} → ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function extractUrls(text, base) {
  const found = new Set();
  const re = /["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi;
  let m;
  while ((m = re.exec(text))) {
    let u = m[1];
    if (u.startsWith('./')) u = u.slice(2);
    if (u.startsWith('/')) u = base + u;
    if (!u.startsWith('http')) u = base + '/' + u;
    found.add(u);
  }
  const re2 = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi;
  while ((m = re2.exec(text))) found.add(m[0]);
  return [...found];
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const html = await fetchText(BASE);
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  console.log('Scripts:', scripts);

  const allUrls = new Set();
  for (const script of scripts) {
    const url = script.startsWith('http') ? script : BASE + '/' + script.replace(/^\//, '');
    console.log('Fetching', url);
    const js = await fetchText(url);
    extractUrls(js, BASE).forEach((u) => allUrls.add(u));
  }

  // Assets statiques courants Angular
  const guesses = [
    '/assets/images/',
    '/assets/img/',
    '/assets/',
  ];
  for (const g of guesses) {
    try {
      const t = await fetchText(BASE + g);
      extractUrls(t, BASE).forEach((u) => allUrls.add(u));
    } catch {
      /* ignore */
    }
  }

  const list = [...allUrls].sort();
  writeFileSync(join(OUT, 'urls.json'), JSON.stringify(list, null, 2));
  console.log(`\n${list.length} URLs trouvées:`);
  list.forEach((u) => console.log(' ', u));

  // Télécharger les 30 premières images
  let n = 0;
  for (const url of list.slice(0, 30)) {
    try {
      const name = url.split('/').pop().split('?')[0] || `img-${n}.jpg`;
      const dest = join(OUT, name);
      await downloadFile(url, dest);
      console.log('✓', name);
      n++;
    } catch (e) {
      console.warn('✗', url, e.message);
    }
  }
}

main().catch(console.error);
