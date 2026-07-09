import type { ImageSourcePropType } from 'react-native';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_MOBILE_APP_CONTENT,
  type MobileAppContent,
} from '../types/appContent';
import { mergeSalonCmsFields, mergeSalonPartnersCms } from '../lib/salonCms';
import { BANK_TRANSFER as DEFAULT_BANK, VIP_PASS as DEFAULT_VIP } from '../data/bankTransfer';

function parseContent(raw: unknown): Partial<MobileAppContent> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Partial<MobileAppContent>;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as Partial<MobileAppContent>;
  return {};
}

export function mergeAppContent(parsed: Partial<MobileAppContent>): MobileAppContent {
  return {
    ...DEFAULT_MOBILE_APP_CONTENT,
    ...parsed,
    hero: { ...DEFAULT_MOBILE_APP_CONTENT.hero, ...(parsed.hero ?? {}) },
    platformStats: parsed.platformStats?.length
      ? parsed.platformStats
      : DEFAULT_MOBILE_APP_CONTENT.platformStats,
    images: { ...DEFAULT_MOBILE_APP_CONTENT.images, ...(parsed.images ?? {}) },
    payment: { ...DEFAULT_MOBILE_APP_CONTENT.payment, ...(parsed.payment ?? {}) },
    salonStats: mergeSalonCmsFields(parsed.salonStats),
    salonPartners: mergeSalonPartnersCms(parsed.salonPartners),
  };
}

export async function fetchAppContentRemote(): Promise<MobileAppContent> {
  try {
    const { data, error } = await supabase.rpc('get_mobile_app_content');
    if (!error && data != null) {
      const merged = mergeAppContent(parseContent(data));
      if (merged.updatedAt || merged.version > 1 || Object.keys(parseContent(data)).length > 0) {
        return merged;
      }
    }
  } catch {
    // RPC pas encore déployée
  }

  return DEFAULT_MOBILE_APP_CONTENT;
}

/** Image locale ou URL distante (CMS admin). */
export function resolveAppImageSource(
  slot: string,
  localFallback: ImageSourcePropType,
  remoteImages?: Record<string, string>,
  cacheBuster?: string,
): ImageSourcePropType {
  const url = remoteImages?.[slot]?.trim();
  if (url) {
    if (!cacheBuster) return { uri: url };
    const sep = url.includes('?') ? '&' : '?';
    return { uri: `${url}${sep}v=${encodeURIComponent(cacheBuster)}` };
  }
  return localFallback;
}

export function resolveBankTransfer(content: MobileAppContent) {
  const p = content.payment ?? {};
  return {
    bankName: p.bankName?.trim() || DEFAULT_BANK.bankName,
    accountHolder: p.accountHolder?.trim() || DEFAULT_BANK.accountHolder,
    iban: p.iban?.trim() || DEFAULT_BANK.iban,
    bic: p.bic?.trim() || DEFAULT_BANK.bic,
    domiciliation: p.domiciliation?.trim() || DEFAULT_BANK.domiciliation,
  };
}

export function resolveVipPass(content: MobileAppContent) {
  return {
    currency: content.payment.currency?.trim() || DEFAULT_VIP.currency,
    label: DEFAULT_VIP.label,
    priceEur: content.payment.vipPriceEur ?? DEFAULT_MOBILE_APP_CONTENT.payment.vipPriceEur ?? 700,
  };
}

export { DEFAULT_MOBILE_APP_CONTENT, type MobileAppContent };
