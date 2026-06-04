import { writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/sib-ma/static');
const BASE = 'https://www.sib.ma';

const GUESSES = [
  '/assets/images/bg/section_02.jpg',
  '/assets/images/bg/section_01.jpg',
  '/assets/images/bg/hero.jpg',
  '/assets/images/bg/banner.jpg',
  '/assets/images/hero.jpg',
  '/assets/images/banner.jpg',
  '/assets/img/hero.jpg',
  '/assets/images/home.jpg',
  '/assets/images/bg/home.jpg',
];

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIB-Platform/1.0' } });
  if (!res.ok) return false;
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return true;
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const html = await fetch(BASE).then((r) => r.text());
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  const assets = new Set(GUESSES.map((g) => g));

  for (const s of scripts) {
    const url = s.startsWith('http') ? s : `${BASE}/${s.replace(/^\//, '')}`;
    const js = await fetch(url).then((r) => r.text());
    const re = /assets\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp|gif|svg)/g;
    let m;
    while ((m = re.exec(js))) assets.add('/' + m[0]);
  }

  const ok = [];
  for (const path of assets) {
    const name = path.split('/').pop();
    const dest = join(OUT, name);
    if (await download(BASE + path, dest)) {
      console.log('✓', path);
      ok.push(path);
    }
  }
  writeFileSync(join(OUT, 'index.json'), JSON.stringify(ok, null, 2));
}

main().catch(console.error);
