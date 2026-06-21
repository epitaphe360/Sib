/** Maps the app locale to a BCP-47 code suitable for toLocaleString / Intl. */
export function localeCode(locale: string): string {
  const map: Record<string, string> = { fr: 'fr-FR', ar: 'ar-MA', en: 'en-US' };
  return map[locale] ?? 'fr-FR';
}
