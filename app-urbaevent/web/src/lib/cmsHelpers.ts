/** Utilitaire CMS — fallback si clé absente ou vide. */
export function cmsValue(
  content: Record<string, string>,
  key: string,
  fallback: string,
): string {
  const value = content[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

export function cmsJsonArray<T>(
  content: Record<string, string>,
  key: string,
  fallback: T[],
): T[] {
  const raw = content[key];
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function cmsParagraphs(
  content: Record<string, string>,
  key: string,
  fallback: string[],
): string[] {
  const raw = cmsValue(content, key, '');
  if (!raw) return fallback;
  const parts = raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts : fallback;
}
