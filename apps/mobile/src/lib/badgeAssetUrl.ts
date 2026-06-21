export interface BadgeAssetUrlEnv {
  siteUrl?: string;
  supabaseUrl?: string;
}

/** Résout une URL d'asset badge (admin /admin/badge-config). */
export function resolveBadgeAssetUrl(
  url?: string,
  env: BadgeAssetUrlEnv = {},
): string | undefined {
  const siteUrl =
    env.siteUrl ??
    process.env.EXPO_PUBLIC_SITE_URL ??
    '';
  const supabaseUrl =
    env.supabaseUrl ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';

  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('brand://')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/') && siteUrl) return `${siteUrl.replace(/\/$/, '')}${trimmed}`;
  if (!trimmed.startsWith('/') && supabaseUrl && !trimmed.includes('://')) {
    const path = trimmed.startsWith('media/') ? trimmed : `media/${trimmed}`;
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  }
  return trimmed.startsWith('/') ? undefined : trimmed;
}
