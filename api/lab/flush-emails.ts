import { labCronAuthorized } from './_guard';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method' });
  }
  if (!labCronAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'unauthorized' });
  }
  try {
    const { flushLabEmails } = await import('../../scripts/lab-email-worker.mjs');
    const result = await flushLabEmails({ dryRun: req.query?.dryRun === '1' });
    return res.json({ success: !result.error, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'flush failed' });
  }
}
