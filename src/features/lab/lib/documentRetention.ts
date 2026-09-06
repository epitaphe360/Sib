export function isWithinRetention(
  createdAt: string | null | undefined,
  retentionDays = 365,
  now = new Date(),
): boolean {
  if (!createdAt) return false;
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return false;
  const days = Number.isFinite(retentionDays) && retentionDays > 0 ? retentionDays : 365;
  return now.getTime() - start <= days * 86_400_000;
}

export function filterRetained<T extends { created_at?: string | null; sent_at?: string | null }>(
  rows: T[],
  retentionDays = 365,
  now = new Date(),
): T[] {
  return rows.filter((row) => isWithinRetention(row.sent_at ?? row.created_at, retentionDays, now));
}
