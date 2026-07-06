export function normalizeParticipantName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function buildParticipantFullName(firstName?: string, lastName?: string): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export function participantNamesMatch(
  badgeFullName: string,
  opts: { firstName?: string; lastName?: string; fullName?: string },
): boolean {
  const target = normalizeParticipantName(
    opts.fullName || buildParticipantFullName(opts.firstName, opts.lastName),
  );
  if (!target) return true;

  const badgeNorm = normalizeParticipantName(badgeFullName);
  if (badgeNorm === target) return true;

  const parts = target.split(' ').filter(Boolean);
  if (parts.length === 0) return true;
  return parts.every((part) => badgeNorm.includes(part));
}
