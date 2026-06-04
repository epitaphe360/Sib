import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = await fetch('https://www.sib.ma/').then((r) => r.text());
const mainJs = [...html.matchAll(/src="(main[^"]+\.js)"/g)].map((m) => m[1])[0];
const js = await fetch(`https://www.sib.ma/${mainJs}`).then((r) => r.text());

const terms = ['section_02', 'section_01', 'banner_default', 'parc_exposition', 'bestof', 'home_banner', 'galeries', 'hero'];
for (const t of terms) {
  const i = js.indexOf(t);
  if (i >= 0) console.log(t, '→', js.slice(Math.max(0, i - 40), i + 80).replace(/\n/g, ' '));
}
