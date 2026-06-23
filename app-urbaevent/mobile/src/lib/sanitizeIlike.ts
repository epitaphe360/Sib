/** Échappe les caractères spéciaux PostgREST ilike (% _ \) */
export function sanitizeIlikeTerm(input: string): string {
  return input
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}
