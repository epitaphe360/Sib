export type AppLocale = 'fr' | 'en' | 'ar';

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Choisit un champ localisé : description_en, translations.en.description, puis valeur de base. */
export function pickLocalizedText(
  source: Record<string, unknown> | null | undefined,
  field: string,
  locale: AppLocale,
): string | undefined {
  if (!source) return undefined;

  if (locale !== 'fr') {
    const direct = asString(source[`${field}_${locale}`]);
    if (direct) return direct;

    const translations = source.translations;
    if (translations && typeof translations === 'object') {
      const bucket = (translations as Record<string, unknown>)[locale];
      if (bucket && typeof bucket === 'object') {
        const fromBucket = asString((bucket as Record<string, unknown>)[field]);
        if (fromBucket) return fromBucket;
      }
    }

    if (locale === 'ar') {
      const en = asString(source[`${field}_en`]);
      if (en) return en;
    }
  }

  return asString(source[field]);
}

export function pickLocalizedStringList(
  source: Record<string, unknown> | null | undefined,
  field: string,
  locale: AppLocale,
): string[] {
  if (!source) return [];

  if (locale !== 'fr') {
    const localized = source[`${field}_${locale}`];
    if (Array.isArray(localized)) {
      return localized.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    }
  }

  const base = source[field];
  if (!Array.isArray(base)) return [];
  return base
    .map((v) => (typeof v === 'string' ? v : (v as { name?: string; title?: string })?.name ?? (v as { title?: string })?.title ?? ''))
    .filter((v) => v.trim().length > 0);
}
