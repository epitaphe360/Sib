import { supabase } from './supabase';

/** Parse app_settings.value ou retour RPC get_badge_config (texte ou objet). */
export function parseBadgeConfigRaw<T extends Record<string, unknown>>(raw: unknown): Partial<T> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Partial<T>;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') {
    return raw as Partial<T>;
  }
  return {};
}

/** Charge badge_config_v1 via RPC publique (APK + visiteurs) avec repli lecture directe. */
export async function fetchBadgeConfigRaw(): Promise<Record<string, unknown>> {
  try {
    const { data, error } = await supabase.rpc('get_badge_config');
    if (!error && data != null) {
      const parsed = parseBadgeConfigRaw<Record<string, unknown>>(data);
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch {
    /* RPC absente */
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'badge_config_v1')
      .maybeSingle();

    if (!error && data?.value != null) {
      const parsed = parseBadgeConfigRaw<Record<string, unknown>>(data.value);
      if (Object.keys(parsed).length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }

  return {};
}
