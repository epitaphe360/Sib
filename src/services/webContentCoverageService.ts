import { SITE_IMAGE_DEFINITIONS } from '../config/siteImagesConfig';
import { HOME_V4_CMS_KEYS } from '../config/homeV4CmsConfig';
import { fetchSiteImages, fetchSiteTextContent } from './siteImagesService';
import { fetchMobileAppContent, type MobileAppContent } from './mobileAppContentService';
import { getAllPageMeta } from '../lib/pageContent';
import { VITRINE_PAGE_SLUGS } from '../config/pageContentAdminConfig';
import { HOME_V4_TEXT_DEFINITIONS } from '../config/homeV4TextCmsConfig';

export type CoverageSection = {
  id: string;
  label: string;
  filled: number;
  total: number;
  percent: number;
  details: string;
};

export type WebContentCoverage = {
  overallPercent: number;
  sections: CoverageSection[];
};

const HOME_TEXT_KEYS = HOME_V4_TEXT_DEFINITIONS.map((d) => d.key);

const MOBILE_HERO_FIELDS = ['badgeOrg', 'titlePart1', 'titlePart2', 'subtitleFr', 'subtitleEn', 'subtitleAr'] as const;

function pct(filled: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((filled / total) * 100);
}

function countMobileContentFilled(content: MobileAppContent): { filled: number; total: number } {
  let filled = 0;
  let total = MOBILE_HERO_FIELDS.length + 4; // 4 stats

  for (const field of MOBILE_HERO_FIELDS) {
    const v = content.hero[field];
    if (typeof v === 'string' && v.trim()) filled += 1;
  }

  for (const stat of content.platformStats.slice(0, 4)) {
    if (stat.value?.trim()) filled += 1;
  }

  total += Object.keys(content.images ?? {}).length > 0 ? 1 : 0;
  if (Object.keys(content.images ?? {}).length > 0) filled += 1;

  return { filled, total };
}

export async function computeWebContentCoverage(): Promise<WebContentCoverage> {
  const [images, texts, pages, mobile] = await Promise.all([
    fetchSiteImages(),
    fetchSiteTextContent(),
    getAllPageMeta(),
    fetchMobileAppContent(),
  ]);

  const homeV4ImagesFilled = HOME_V4_CMS_KEYS.filter((key) =>
    images.some((row) => row.key === key && row.image_url?.trim()),
  ).length;

  const homeTextsFilled = HOME_TEXT_KEYS.filter((key) => {
    const row = texts.find((t) => t.key === key);
    return Boolean(row?.value_fr?.trim() || row?.value_en?.trim() || row?.value_ar?.trim());
  }).length;

  const pageSlugsWithContent = VITRINE_PAGE_SLUGS.filter((def) =>
    pages.some((p) => p.page_slug === def.slug && Object.keys(p.content ?? {}).length > 0),
  ).length;

  const allImagesFilled = SITE_IMAGE_DEFINITIONS.filter((def) =>
    images.some((row) => row.key === def.key && row.image_url?.trim()),
  ).length;

  const mobileCounts = countMobileContentFilled(mobile);

  const sections: CoverageSection[] = [
    {
      id: 'home_v4_images',
      label: 'Accueil SIB 2026 — photos (v4)',
      filled: homeV4ImagesFilled,
      total: HOME_V4_CMS_KEYS.length,
      percent: pct(homeV4ImagesFilled, HOME_V4_CMS_KEYS.length),
      details: `${homeV4ImagesFilled}/${HOME_V4_CMS_KEYS.length} images personnalisées`,
    },
    {
      id: 'home_v4_texts',
      label: 'Accueil SIB 2026 — textes & chiffres',
      filled: homeTextsFilled,
      total: HOME_TEXT_KEYS.length,
      percent: pct(homeTextsFilled, HOME_TEXT_KEYS.length),
      details: `${homeTextsFilled}/${HOME_TEXT_KEYS.length} champs remplis (FR/EN/AR)`,
    },
    {
      id: 'vitrine_pages',
      label: 'Pages vitrine (20 slugs)',
      filled: pageSlugsWithContent,
      total: VITRINE_PAGE_SLUGS.length,
      percent: pct(pageSlugsWithContent, VITRINE_PAGE_SLUGS.length),
      details: `${pageSlugsWithContent}/${VITRINE_PAGE_SLUGS.length} pages avec contenu CMS`,
    },
    {
      id: 'all_site_images',
      label: 'Toutes les photos site',
      filled: allImagesFilled,
      total: SITE_IMAGE_DEFINITIONS.length,
      percent: pct(allImagesFilled, SITE_IMAGE_DEFINITIONS.length),
      details: `${allImagesFilled}/${SITE_IMAGE_DEFINITIONS.length} uploads personnalisés`,
    },
    {
      id: 'mobile_apk',
      label: 'Contenu APK mobile',
      filled: mobileCounts.filled,
      total: mobileCounts.total,
      percent: pct(mobileCounts.filled, mobileCounts.total),
      details: `${mobileCounts.filled}/${mobileCounts.total} champs hero/stats/images`,
    },
  ];

  const overallPercent = Math.round(
    sections.reduce((sum, s) => sum + s.percent, 0) / sections.length,
  );

  return { overallPercent, sections };
}
