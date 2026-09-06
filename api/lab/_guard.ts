export function labCronAuthorized(req: { headers?: Record<string, unknown> }): boolean {
  const secret = process.env.LAB_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  const headers = req.headers || {};
  const bearer = String(headers.authorization || headers.Authorization || '');
  const header = String(headers['x-lab-cron-secret'] || '');
  return header === secret || bearer === `Bearer ${secret}`;
}
