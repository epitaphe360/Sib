/**
 * Synchronise texte + mapping photos EXACT sib.ma (Strapi + ordre galerie site)
 * → public/sib-ma/content.json
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/sib-ma');
const API = 'https://sib.ma/backend/api';

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mediaUrl(rel) {
  if (!rel) return null;
  return rel.startsWith('http') ? rel : `https://sib.ma/backend${rel}`;
}

function pickMedia(data) {
  const m = data?.data?.attributes;
  if (!m?.url) return null;
  return {
    url: mediaUrl(m.url),
    hash: m.hash,
    width: m.width,
    height: m.height,
    ext: m.ext || '.jpg',
    local: m.hash ? `/sib-ma/${m.hash}${m.ext || '.jpg'}` : null,
    caption: m.caption || m.name,
  };
}

function formatNumber(n, prefixPlus = false) {
  const s = Number(n).toLocaleString('fr-FR').replace(/\s/g, ' ');
  return prefixPlus ? `+ ${s}` : s;
}

function findGallery(galeries, test) {
  return galeries.find((g) => g.local && test(g));
}

function findByCaption(galeries, re) {
  return findGallery(galeries, (g) => re.test(g.caption || ''));
}

function findByYear(galeries, year) {
  return findGallery(galeries, (g) => (g.caption || '').includes(String(year)));
}

/** Photos assignées comme sur https://www.sib.ma/ (galerie Best Of + bannières API) */
function buildImageSlots(galeries, banner, activiteBanner) {
  const firstBestOf = galeries.find((g) => g.local) || null;

  const salonCards = {
    exposer: findByCaption(galeries, /Stand L\.A\.P|Sponsor Officiel.*2024/i),
    visiter: findByCaption(galeries, /Visiteurs.*2024/i),
    sib_talks: findByCaption(galeries, /Conférences SIB 2024/i),
    b2b: findByCaption(galeries, /B2B FMC.*2024/i),
    diner: findByCaption(galeries, /Inauguration officielle.*2024/i),
    international: findByCaption(galeries, /Espace Démonstration|Stand CROAC.*2024/i),
  };

  const timelineYears = [1986, 2000, 2012, 2022, 2026];
  const timeline = {
    1986: findByCaption(galeries, /Ministère.*2022/i) || firstBestOf,
    2000: findByCaption(galeries, /TTH COMPANY.*2022/i) || findGallery(galeries, (g) => g.position === 4),
    2012: findByCaption(galeries, /SIB STADIUM.*2022/i) || findGallery(galeries, (g) => g.position === 5),
    2022: findByCaption(galeries, /CROAC.*2022/i) || findByYear(galeries, 2022),
    2026: banner,
  };

  return {
    hero: {
      ...firstBestOf,
      source: 'galeries[0] — 1er visuel Best Of sib.ma (ordre Strapi position)',
    },
    heroBanner: banner
      ? { ...banner, source: 'sib.banner_default — Parc Mohammed VI (bannière site)' }
      : null,
    mission: {
      ...(findByCaption(galeries, /Inauguration officielle.*2024/i) ||
        findByCaption(galeries, /Inauguration Mme FATIMA/i)),
      source: 'galerie Best Of — inauguration (comme section présentation sib.ma)',
    },
    reserve: banner
      ? { ...banner, source: 'sib.banner_default — même visuel bloc lieu sur sib.ma' }
      : null,
    sectionBg: {
      local: '/sib-ma/static/section_02.jpg',
      caption: 'assets/images/bg/section_02.jpg (fond titres sib.ma)',
      source: 'www.sib.ma/assets statique',
    },
    activiteSecteurs: activiteBanner,
    salonCards: Object.fromEntries(
      Object.entries(salonCards).map(([k, v]) => [
        k,
        v ? { ...v, source: `galerie Best Of — ${v.caption}` } : null,
      ]),
    ),
    timeline: Object.fromEntries(
      timelineYears.map((y) => [
        y,
        timeline[y]
          ? { ...timeline[y], source: `timeline ${y} — ${timeline[y].caption || 'banner'}` }
          : null,
      ]),
    ),
    bestOfOrder: galeries.filter((g) => g.local).map((g) => ({
      position: g.position,
      caption: g.caption,
      local: g.local,
    })),
  };
}

async function fetchJson(path) {
  const res = await fetch(`${API}/${path}`, {
    headers: { 'User-Agent': 'SIB-Platform/1.0', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const [sibRes, editionsRes, galeriesRes, activiteRes] = await Promise.all([
    fetchJson('sib?populate=*'),
    fetchJson('editions?sort=annee:asc&pagination[pageSize]=100'),
    fetchJson('galeries?populate[image]=true&sort=position:asc&pagination[pageSize]=100'),
    fetchJson('activite?populate[banner_image]=true'),
  ]);

  const a = sibRes.data?.attributes || {};
  const banner = pickMedia(a.banner_default);
  const activiteBanner = pickMedia(activiteRes.data?.attributes?.banner_image);

  const editions = (editionsRes.data || []).map((e) => ({
    year: e.attributes.annee,
    edition: e.attributes.edition,
    slogan: e.attributes.slogan,
    exposants: e.attributes.exposants,
    visiteurs: e.attributes.visiteurs,
    emplacement: e.attributes.emplacement,
  }));

  const TIMELINE_YEARS = [1986, 2000, 2012, 2022, 2026];
  const timeline = TIMELINE_YEARS.map((year) => {
    if (year === 2026) {
      return { year, edition: '20ᵉ édition', slogan: "40 années d'existence — SIB 2026" };
    }
    const match = editions.find((e) => e.year === year);
    return match || { year, edition: '', slogan: '' };
  });

  const galeries = (galeriesRes.data || []).map((g) => {
    const img = g.attributes?.image?.data?.attributes;
    return {
      caption: g.attributes.caption,
      position: g.attributes.position,
      hash: img?.hash,
      ext: img?.ext,
      local: img?.hash ? `/sib-ma/${img.hash}${img.ext || '.jpg'}` : null,
    };
  });

  const imageSlots = buildImageSlots(galeries, banner, activiteBanner);

  const content = {
    source: 'https://www.sib.ma/',
    syncedAt: new Date().toISOString(),
    titre: a.titre || 'SIB 2026',
    titrePresentation: a.titre_presentation || 'Le Salon International du Bâtiment',
    date: a.date || '25 - 29 Novembre 2026',
    longueDate: a.longue_date || 'Du 25 au 29 Novembre 2026',
    emplacement: a.emplacement || "Parc d'Exposition Mohammed VI - EL JADIDA",
    majesteSlogan: a.majeste_slogan || null,
    descriptionSalon: stripHtml(a.description_salon),
    descriptionEmplacement: stripHtml(a.description_emplacement),
    chiffresDescription: stripHtml(a.chiffre_description),
    pourquoiExposer: stripHtml(a.pourquoi_exposer),
    pourquoiVisiter: stripHtml(a.pourquoi_visiter),
    titreDerniereEdition: a.titre_derniere_edition || 'SIB 2024',
    stats: {
      exposants: formatNumber(a.chiffre_exposants ?? 500, true),
      pays: String(a.chiffre_pays ?? 50),
      visiteurs: formatNumber(a.chiffre_visiteurs ?? 200000, true),
      surface: formatNumber(a.chiffre_expositions ?? 30000, false),
    },
    statsLabels: {
      exposants: 'Exposants',
      pays: 'Pays',
      visiteurs: 'Visiteurs',
      surface: "Surface d'exposition",
    },
    banner,
    brochure: a.brochure?.data?.attributes
      ? { url: mediaUrl(a.brochure.data.attributes.url), name: a.brochure.data.attributes.name }
      : null,
    timeline,
    galeries,
    imageSlots,
    siteUrl: 'https://www.sib.ma/',
  };

  writeFileSync(join(OUT, 'content.json'), JSON.stringify(content, null, 2));
  writeFileSync(
    join(ROOT, 'src/components/home/sib2026/sibMaAssets.generated.json'),
    JSON.stringify(imageSlots, null, 2),
  );

  console.log('✓ content.json + sibMaAssets.generated.json');
  console.log('  Hero:', imageSlots.hero?.caption);
  console.log('  Mission:', imageSlots.mission?.caption);
  console.log('  Reserve:', imageSlots.reserve?.caption);
  for (const [k, v] of Object.entries(imageSlots.salonCards)) {
    console.log(`  Carte ${k}:`, v?.caption || '—');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
