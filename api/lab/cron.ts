import { labCronAuthorized } from './_guard';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method' });
  }
  if (!labCronAuthorized(req)) {
    return res.status(401).json({ success: false, error: 'unauthorized' });
  }
  try {
    const { runLabCron } = await import('../../scripts/lab-cron.mjs');
    const cron = await runLabCron({ dryRun: req.query?.dryRun === '1' });
    if (req.query?.flush === '1' && !cron.error) {
      const { flushLabEmails } = await import('../../scripts/lab-email-worker.mjs');
      const flush = await flushLabEmails({ dryRun: req.query?.dryRun === '1' });
      return res.json({ success: !flush.error, cron, flush });
    }
    return res.json({ success: !cron.error, cron });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'cron failed' });
  }
}
