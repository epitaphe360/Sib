/** Affiche « A-12 · Hall 1 » sans doubler le préfixe Hall si déjà présent en base. */
export function formatStandHallLine(standNumber?: string | null, hallNumber?: string | null): string {
  const stand = standNumber?.trim();
  const hallRaw = hallNumber?.trim();

  if (!stand && !hallRaw) return '—';

  const hallLabel = hallRaw
    ? /^hall\s/i.test(hallRaw)
      ? hallRaw
      : `Hall ${hallRaw}`
    : null;

  if (stand && hallLabel) return `${stand} · ${hallLabel}`;
  return stand ?? hallLabel ?? '—';
}
