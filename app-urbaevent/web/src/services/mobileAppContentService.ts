import { supabase, isSupabaseReady } from '../lib/supabase';

export type MobilePlatformStat = { value: string; labelKey: string };

export type MobileAppContent = {
  version: number;
  updatedAt: string;
  hero: {
    badgeOrg: string;
    titlePart1: string;
    titlePart2: string;
    subtitleFr: string;
    subtitleEn: string;
    subtitleAr: string;
  };
  platformStats: MobilePlatformStat[];
  images: Record<string, string>;
  payment: {
    iban?: string;
    bic?: string;
    bankName?: string;
    accountHolder?: string;
    domiciliation?: string;
    vipPriceEur?: number;
    currency?: string;
  };
  salonStats?: Record<string, { visitors?: string; edition?: string; description?: string }>;
};

export const DEFAULT_MOBILE_APP_CONTENT: MobileAppContent = {
  version: 1,
  updatedAt: '',
  hero: {
    badgeOrg: 'URBACOM',
    titlePart1: 'Urba',
    titlePart2: 'Event',
    subtitleFr: 'La plateforme officielle des salons UrbaEvent',
    subtitleEn: 'The official UrbaEvent trade shows platform',
    subtitleAr: 'المنصة الرسمية لمعارض UrbaEvent',
  },
  platformStats: [
    { value: '5', labelKey: 'home.urba.statSalons' },
    { value: '500+', labelKey: 'home.urba.statExhibitors' },
    { value: '25K+', labelKey: 'home.urba.statVisitors' },
    { value: '40+', labelKey: 'home.urba.statCountries' },
  ],
  images: {},
  payment: { vipPriceEur: 700, currency: 'EUR' },
  salonStats: {},
};

export function mergeMobileAppContent(raw: unknown): MobileAppContent {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<MobileAppContent>;
  return {
    ...DEFAULT_MOBILE_APP_CONTENT,
    ...r,
    hero: { ...DEFAULT_MOBILE_APP_CONTENT.hero, ...(r.hero ?? {}) },
    platformStats: r.platformStats?.length ? r.platformStats : DEFAULT_MOBILE_APP_CONTENT.platformStats,
    images: { ...DEFAULT_MOBILE_APP_CONTENT.images, ...(r.images ?? {}) },
    payment: { ...DEFAULT_MOBILE_APP_CONTENT.payment, ...(r.payment ?? {}) },
    salonStats: { ...DEFAULT_MOBILE_APP_CONTENT.salonStats, ...(r.salonStats ?? {}) },
  };
}

export async function fetchMobileAppContent(): Promise<MobileAppContent> {
  if (!isSupabaseReady || !supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.rpc('get_mobile_app_content');
  if (error) throw new Error(error.message);
  return mergeMobileAppContent(data);
}

export async function saveMobileAppContent(content: MobileAppContent): Promise<void> {
  if (!isSupabaseReady || !supabase) throw new Error('Supabase non configuré');
  const payload = {
    ...content,
    version: (content.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'mobile_app_content_v1', value: payload, updated_at: payload.updatedAt }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function uploadMobileAppImage(
  slot: string,
  file: File,
): Promise<string> {
  if (!isSupabaseReady || !supabase) throw new Error('Supabase non configuré');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `mobile-app/${slot}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/jpeg' });
  if (uploadError) throw new Error(uploadError.message);
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}
