import Constants from 'expo-constants';
import { SALON_INFO } from '../data/salons';
import { PLATFORM } from '../config/platform';
import { resolveBadgeAssetUrl as resolveBadgeAssetUrlCore } from '../lib/badgeAssetUrl';
import { supabase } from '../lib/supabase';

export interface BadgeDayProgram {
  id: string;
  date: string;
  label: string;
  sessions: { time: string; title: string; type: string }[];
  open?: boolean;
}

export interface FeaturedSponsor {
  id: string;
  name: string;
  logo_url: string;
  role: string;
  order: number;
}

export type FaceContent =
  | 'partenaires'
  | 'programme'
  | 'infos_pratiques'
  | 'app_promo'
  | 'image_pleine'
  | 'carte_de_visite'
  | 'identite_participant';

export interface BadgeConfig {
  event_name: string;
  event_edition: string;
  event_dates_display: string;
  event_location: string;
  event_location_detail: string;
  badge_validity_text_fr: string;
  badge_validity_text_en: string;
  primary_color: string;
  secondary_color: string;
  header_bg: string;
  text_dark: string;
  accent_color: string;
  logo_main_url: string;
  logo_ministry_url: string;
  logo_sponsor_1_url: string;
  logo_sponsor_1_label: string;
  logo_sponsor_2_url: string;
  logo_sponsor_2_label: string;
  logo_sponsor_3_url: string;
  logo_sponsor_3_label: string;
  show_program_on_badge: string;
  program_compact_mode: string;
  program_days: BadgeDayProgram[];
  partners_section_title: string;
  show_app_promo: string;
  app_promo_title: string;
  app_promo_subtitle: string;
  app_store_url: string;
  google_play_url: string;
  app_promo_image_url: string;
  logo_organizer_url: string;
  logo_organizer_label: string;
  logo_delegate_url: string;
  logo_delegate_label: string;
  logo_badging_url: string;
  logo_badging_label: string;
  logo_media_url: string;
  logo_media_label: string;
  logo_digital_url: string;
  logo_digital_label: string;
  logo_aegis_url: string;
  logo_aegis_label: string;
  face1_content: FaceContent;
  face2_content: FaceContent;
  face3_content: FaceContent;
  face4_content: FaceContent;
  featured_sponsors: FeaturedSponsor[];
  partners_rows_config: number[];
  partners_logo_height: number;
  opening_hours: string;
  location_address: string;
  location_qr_url: string;
  how_to_get_there: string;
  contact_phone: string;
  contact_email: string;
  contact_website: string;
  dates_label: string;
}

/** Résout une URL d'asset badge (admin /admin/badge-config). */
export function resolveBadgeAssetUrl(url?: string): string | undefined {
  return resolveBadgeAssetUrlCore(url, {
    siteUrl:
      process.env.EXPO_PUBLIC_SITE_URL ??
      Constants.expoConfig?.extra?.siteUrl ??
      '',
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      Constants.expoConfig?.extra?.supabaseUrl ??
      '',
  });
}

export const DEFAULT_BADGE_CONFIG: BadgeConfig = {
  event_name: SALON_INFO.name,
  event_edition: '20ème édition',
  event_dates_display: SALON_INFO.dates,
  event_location: SALON_INFO.city,
  event_location_detail: SALON_INFO.venue,
  badge_validity_text_fr: "CECI EST VOTRE BADGE D'ACCÈS VALABLE POUR LES 5 JOURS DU SALON",
  badge_validity_text_en: 'THIS DOCUMENT IS YOUR ENTRY BADGE VALID FOR THE 5 DAYS OF THE EXHIBITION',
  primary_color: '#1e3a5f',
  secondary_color: '#F39200',
  header_bg: '#1e3a5f',
  text_dark: '#111827',
  accent_color: '#3ECF8E',
  logo_main_url: 'brand://logo-sib2026.png',
  logo_ministry_url: 'brand://logo-ministere.png',
  logo_sponsor_1_url: '',
  logo_sponsor_1_label: 'Partenaire Officiel',
  logo_sponsor_2_url: '',
  logo_sponsor_2_label: 'Co-Organisateur',
  logo_sponsor_3_url: '',
  logo_sponsor_3_label: 'Partenaire Médias',
  show_program_on_badge: 'true',
  program_compact_mode: 'false',
  program_days: [],
  partners_section_title: "Sous le Haut Patronage de Sa Majesté le Roi",
  show_app_promo: 'true',
  app_promo_title: 'Développez votre réseau Professionnel avec URBA event',
  app_promo_subtitle: 'Networking · Rendez-vous · Programme · Annuaire',
  app_store_url: 'https://apps.apple.com',
  google_play_url: 'https://play.google.com/store/apps/details?id=com.urbacom.urbaevent',
  app_promo_image_url: '',
  logo_organizer_url: '',
  logo_organizer_label: 'Organisateur',
  logo_delegate_url: '',
  logo_delegate_label: 'Organisateur délégué',
  logo_badging_url: '',
  logo_badging_label: 'Partenaire Badging',
  logo_media_url: '',
  logo_media_label: 'Partenaire Médias',
  logo_digital_url: '',
  logo_digital_label: 'Partenaire Digital',
  logo_aegis_url: '',
  logo_aegis_label: "Sous l'égide de",
  face1_content: 'infos_pratiques',
  face2_content: 'carte_de_visite',
  face3_content: 'identite_participant',
  face4_content: 'partenaires',
  featured_sponsors: [],
  partners_rows_config: [3, 3],
  partners_logo_height: 13,
  opening_hours: 'de 9h30 à 18h30 · Vendredi & Samedi / de 9h à 17h30 · Dimanche',
  location_address: "Parc d'Expositions Mohammed VI, El Jadida",
  location_qr_url: '',
  how_to_get_there: 'Accessible depuis la rocade — sortie Marjane et Décathlon Ain Sebaa',
  contact_phone: '+212 6 88 50 05 00',
  contact_email: PLATFORM.supportEmail,
  contact_website: 'www.urbaevent.com',
  dates_label: SALON_INFO.dates,
};

function parseConfigValue(raw: unknown): Partial<BadgeConfig> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Partial<BadgeConfig>;
    } catch {
      return {};
    }
  }
  return raw as Partial<BadgeConfig>;
}

function mergeBadgeConfig(parsed: Partial<BadgeConfig>): BadgeConfig {
  return {
    ...DEFAULT_BADGE_CONFIG,
    ...parsed,
    program_days: parsed.program_days ?? DEFAULT_BADGE_CONFIG.program_days,
    featured_sponsors: parsed.featured_sponsors ?? DEFAULT_BADGE_CONFIG.featured_sponsors,
    partners_rows_config: parsed.partners_rows_config ?? DEFAULT_BADGE_CONFIG.partners_rows_config,
  };
}

export async function fetchBadgeConfig(): Promise<BadgeConfig> {
  // 1. RPC publique — contourne RLS admin-only sur app_settings
  try {
    const { data, error } = await supabase.rpc('get_badge_config');
    if (!error && data && typeof data === 'object' && Object.keys(data as object).length > 0) {
      return mergeBadgeConfig(parseConfigValue(data));
    }
  } catch {
    // RPC pas encore déployée
  }

  // 2. Lecture directe (admins ou policy badge_config)
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'badge_config_v1')
      .maybeSingle();

    if (!error && data?.value) {
      return mergeBadgeConfig(parseConfigValue(data.value));
    }

    if (error?.code === '42P01' || error?.code === '42501' || error?.code === 'PGRST301') {
      return DEFAULT_BADGE_CONFIG;
    }
  } catch {
    // fallback
  }

  return DEFAULT_BADGE_CONFIG;
}
