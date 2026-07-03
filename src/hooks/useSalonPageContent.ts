import { useMemo } from 'react';
import { usePageContent } from './usePageContent';
import { cmsJsonArray, cmsValue } from '../lib/cmsHelpers';
import {
  DEFAULT_SALON_DETAILS,
  DEFAULT_SALONS_HUB,
  buildDefaultSalonCards,
  type SalonCardContent,
  type SalonDetailContent,
  type PlatformStat,
} from '../data/salonPagesDefaults';
import { ROUTES } from '../lib/routes';

function mergeSalonDetail(raw: Record<string, string>, salonId: string): SalonDetailContent {
  const base = DEFAULT_SALON_DETAILS[salonId];
  if (!base) throw new Error(`Unknown salon: ${salonId}`);

  return {
    ...base,
    code: cmsValue(raw, 'code', base.code),
    name: cmsValue(raw, 'name', base.name),
    tagline: cmsValue(raw, 'tagline', base.tagline),
    description: cmsValue(raw, 'description', base.description),
    dates: cmsValue(raw, 'dates', base.dates),
    location: cmsValue(raw, 'location', base.location),
    venue: cmsValue(raw, 'venue', base.venue),
    visitors: cmsValue(raw, 'visitors', base.visitors),
    exhibitors: cmsValue(raw, 'exhibitors', base.exhibitors),
    edition: cmsValue(raw, 'edition', base.edition),
    color: cmsValue(raw, 'color', base.color),
    bgColor: cmsValue(raw, 'bgColor', base.bgColor),
    gradient: cmsValue(raw, 'gradient', base.gradient),
    highlights: cmsJsonArray(raw, 'highlights_json', base.highlights),
    features: cmsJsonArray(raw, 'features_json', base.features),
    program: cmsJsonArray(raw, 'program_json', base.program),
  };
}

function mergeSalonCard(
  base: SalonCardContent,
  override?: Partial<SalonCardContent>,
): SalonCardContent {
  if (!override) return base;
  return {
    ...base,
    ...override,
    id: base.id,
    route: base.route,
    features: override.features?.length ? override.features : base.features,
  };
}

export function useSalonDetailContent(salonId: string): SalonDetailContent | null {
  const cms = usePageContent(`salon_${salonId}`);
  return useMemo(() => {
    if (!DEFAULT_SALON_DETAILS[salonId]) return null;
    return mergeSalonDetail(cms, salonId);
  }, [cms, salonId]);
}

export function useSalonsHubContent() {
  const cms = usePageContent('salons_hub');
  const defaultCards = useMemo(() => buildDefaultSalonCards(ROUTES), []);

  return useMemo(() => {
    const cardOverrides = cmsJsonArray<Partial<SalonCardContent>>(cms, 'salons_cards_json', []);
    const cards = defaultCards.map((card) => {
      const override = cardOverrides.find((c) => c.id === card.id);
      return mergeSalonCard(card, override);
    });

    return {
      heroBadge: cmsValue(cms, 'hero_badge', DEFAULT_SALONS_HUB.hero_badge),
      heroBadgeSub: cmsValue(cms, 'hero_badge_sub', DEFAULT_SALONS_HUB.hero_badge_sub),
      heroTitle: cmsValue(cms, 'hero_title', DEFAULT_SALONS_HUB.hero_title),
      heroSubtitle: cmsValue(cms, 'hero_subtitle', DEFAULT_SALONS_HUB.hero_subtitle),
      platformStats: cmsJsonArray<PlatformStat>(cms, 'platform_stats_json', DEFAULT_SALONS_HUB.platform_stats),
      chooseTitle: cmsValue(cms, 'choose_title', DEFAULT_SALONS_HUB.choose_title),
      chooseSubtitleConnected: cmsValue(cms, 'choose_subtitle_connected', DEFAULT_SALONS_HUB.choose_subtitle_connected),
      chooseSubtitleGuest: cmsValue(cms, 'choose_subtitle_guest', DEFAULT_SALONS_HUB.choose_subtitle_guest),
      aboutKicker: cmsValue(cms, 'about_kicker', DEFAULT_SALONS_HUB.about_kicker),
      aboutTitle: cmsValue(cms, 'about_title', DEFAULT_SALONS_HUB.about_title),
      aboutText: cmsValue(cms, 'about_text', DEFAULT_SALONS_HUB.about_text),
      aboutStats: cmsJsonArray<{ v: string; l: string }>(cms, 'about_stats_json', DEFAULT_SALONS_HUB.about_stats),
      ctaTitle: cmsValue(cms, 'cta_title', DEFAULT_SALONS_HUB.cta_title),
      ctaSubtitle: cmsValue(cms, 'cta_subtitle', DEFAULT_SALONS_HUB.cta_subtitle),
      salons: cards,
    };
  }, [cms, defaultCards]);
}

export const SALON_DETAIL_SLUGS = ['sir', 'sip', 'btp', 'sie'] as const;
