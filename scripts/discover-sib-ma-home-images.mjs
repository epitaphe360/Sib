/**
 * Découvre les URLs d'images utilisées sur https://www.sib.ma/
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = 'https://www.sib.ma';
const API = 'https://sib.ma/backend';

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIB-Platform/1.0' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function collectUrls(text) {
  const found = new Set();
  const patterns = [
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi,
    /\/uploads\/[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp)/gi,
    /\/assets\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp|gif)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      let u = m[0];
      if (u.startsWith('/uploads')) u = `${API}${u}`;
      else if (u.startsWith('/assets')) u = `${BASE}${u}`;
      found.add(u);
    }
  }
  return [...found];
}

async function main() {
  const html = await fetchText(BASE);
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  const all = new Set(collectUrls(html));

  for (const s of scripts) {
    const url = s.startsWith('http') ? s : `${BASE}/${s.replace(/^\//, '')}`;
    try {
      const js = await fetchText(url);
      collectUrls(js).forEach((u) => all.add(u));
    } catch {
      /* skip */
    }
  }

  const sorted = [...all].sort();
  writeFileSync(join(ROOT, 'public/sib-ma/homepage-image-urls.json'), JSON.stringify(sorted, null, 2));
  console.log(`${sorted.length} URLs`);
  sorted.forEach((u) => console.log(u));
}

main().catch(console.error);
